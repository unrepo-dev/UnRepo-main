import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import GitHubService from '@/lib/github';
import { analyzeRepositoryWithClaude } from '@/lib/ai';
import { successResponse, errorResponse } from '@/lib/validation';

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
      type: 'RESEARCH',
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
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return errorResponse('API key is required', 401);
    }

    // Verify API key
    const key = await verifyApiKey(apiKey);

    // Get request body
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return errorResponse('Repository URL is required');
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
        endpoint: '/api/research',
        method: 'POST',
        requestData: { repoUrl },
      },
    });

    const response = successResponse({
      repository: {
        owner: repoData.owner,
        name: repoData.name,
        url: repoData.url,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stars,
        forks: repoData.forks,
      },
      languages,
      analysis: analysis || {
        message: 'AI analysis unavailable - configure OpenAI API key',
      },
      rugPotential: analysis?.rugPotential || null,
      codeQuality: analysis?.codeQuality || null,
      aiGenerated: analysis?.aiGenerated || null,
    });
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error: any) {
    console.error('Research API error:', error);
    const response = errorResponse(error.message || 'Research failed', 500);
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}
