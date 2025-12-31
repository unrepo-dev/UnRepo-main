import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GitHubService from '@/lib/github';
import { analyzeRepositoryWithClaude, chatWithRepository } from '@/lib/ai';
import { successResponse, errorResponse } from '@/lib/validation';
import { redisHelpers } from '@/lib/redis';
import { APP_CONFIG } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Add CORS headers for external API usage
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Verify API key
async function verifyApiKey(apiKey: string) {
  const key = await prisma.apiKey.findFirst({
    where: {
      key: apiKey,
      type: 'CHATBOT',
      isActive: true,
    },
    include: {
      user: true,
    },
  });

  if (!key) {
    throw new Error('Invalid or inactive API key');
  }

  // Update usage stats
  await prisma.apiKey.update({
    where: { id: key.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return key;
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key (for external integrations)
    const apiKey = request.headers.get('x-api-key');
    
    // Check for session (for web interface)
    const session = await getServerSession(authOptions);
    
    if (!apiKey && (!session || !session.user)) {
      return errorResponse('Authentication required - API key or GitHub login', 401);
    }

    let user;

    if (apiKey) {
      // API key authentication
      const key = await verifyApiKey(apiKey);
      user = key.user;
    } else if (session) {
      // Session authentication - use the ID from session
      const userId = (session.user as any).id;
      
      if (!userId) {
        return errorResponse('User session invalid - please login again', 401);
      }

      user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return errorResponse('User not found', 404);
      }
    }

    // Get request body
    const body = await request.json();
    
    // Handle chat messages (web interface)
    if (body.message && body.sessionId) {
      const { message, repoUrl, sessionId } = body;

      if (!message || !sessionId) {
        return errorResponse('Message and sessionId are required');
      }

      // Check chat limit
      const messageCount = await redisHelpers.getChatMessageCount(user!.id, sessionId);
      
      if (messageCount >= APP_CONFIG.chat.freeUserLimit && !user!.isTokenHolder) {
        return errorResponse(
          `You've reached the free tier limit of ${APP_CONFIG.chat.freeUserLimit} messages. Verify token holdings to continue.`,
          429
        );
      }

      // Get chat history
      const history = await redisHelpers.getChatHistory(sessionId);

      // Call AI
      const response = await chatWithRepository(
        [...history, { role: 'user', content: message }],
        {
          repoUrl: repoUrl || '',
          repoOwner: '',
          repoName: '',
          files: [],
        }
      );

      // Save messages
      await redisHelpers.saveChatMessage(sessionId, { role: 'user', content: message });
      await redisHelpers.saveChatMessage(sessionId, { role: 'assistant', content: response });
      const newCount = await redisHelpers.incrementChatCount(user!.id, sessionId);

      // Save to database
      await prisma.chatMessage.createMany({
        data: [
          {
            userId: user!.id,
            sessionId,
            role: 'user',
            content: message,
            repoContext: repoUrl,
          },
          {
            userId: user!.id,
            sessionId,
            role: 'assistant',
            content: response,
            repoContext: repoUrl,
          },
        ],
      });

      const apiResponse = successResponse({
        response,
        messageCount: newCount,
        remaining: user!.isTokenHolder ? 'unlimited' : APP_CONFIG.chat.freeUserLimit - newCount,
      });
      
      // Add CORS headers for external API usage
      if (apiKey) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          apiResponse.headers.set(key, value);
        });
      }
      
      return apiResponse;
    }

    // Handle repository analysis (API key only)
    const { repoUrl, format = 'standard' } = body;

    if (!repoUrl) {
      return errorResponse('Repository URL is required');
    }

    // Validate format
    if (!['standard', 'compact', 'detailed'].includes(format)) {
      return errorResponse('Invalid format. Use: standard, compact, or detailed');
    }

    // Parse and fetch repository
    const githubService = new GitHubService();
    const parsed = githubService.parseRepoUrl(repoUrl);

    if (!parsed) {
      return errorResponse('Invalid GitHub URL');
    }

    const { owner, repo } = parsed;

    // Fetch repository data
    const repoData = await githubService.getRepository(owner, repo);
    
    // Fetch file tree and languages in parallel
    const [fileTree, languages] = await Promise.all([
      githubService.getFileTree(owner, repo, repoData.branch),
      githubService.getLanguages(owner, repo),
    ]);

    // Get sample files for analysis
    const sampleFiles = await githubService.getMultipleFiles(
      owner,
      repo,
      ['README.md', 'package.json', 'Cargo.toml', 'go.mod', 'requirements.txt'],
      repoData.branch
    );

    // Run AI analysis
    let analysis = null;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
      try {
        analysis = await analyzeRepositoryWithClaude({
          repoUrl,
          repoOwner: owner,
          repoName: repo,
          files: sampleFiles,
          structure: fileTree,
        });
      } catch (error: any) {
        console.error('AI analysis failed:', error.message);
      }
    }

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        userId: key.userId,
        apiKeyId: key.id,
        endpoint: '/api/chatbot',
        method: 'POST',
        requestData: { repoUrl, format },
      },
    });

    // Format response based on requested format
    if (format === 'compact') {
      return successResponse({
        repo: `${owner}/${repo}`,
        rugScore: analysis?.rugPotential || 'unknown',
        summary: analysis?.summary || 'Analysis unavailable',
      });
    }

    if (format === 'detailed') {
      return successResponse({
        repository: {
          owner: repoData.owner,
          name: repoData.name,
          url: repoData.url,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stars,
          forks: repoData.forks,
          branch: repoData.branch,
          updatedAt: repoData.updatedAt,
        },
        languages,
        fileTree: fileTree.children,
        analysis: analysis || { message: 'AI analysis unavailable' },
        sampleFiles,
      });
    }

    // Standard format
    return successResponse({
      repository: {
        owner: repoData.owner,
        name: repoData.name,
        url: repoData.url,
        description: repoData.description,
        language: repoData.language,
      },
      rugPotential: analysis?.rugPotential || null,
      codeQuality: analysis?.codeQuality || null,
      summary: analysis?.summary || null,
    });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return errorResponse(error.message || 'Chatbot integration failed', 500);
  }
}
