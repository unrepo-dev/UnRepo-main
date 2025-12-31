import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import GitHubService from '@/lib/github';
import { analyzeRepositoryWithClaude } from '@/lib/ai';
import { redisHelpers } from '@/lib/redis';
import { successResponse, errorResponse } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow access for authenticated users (GitHub or Wallet)
    // For now, we'll allow unauthenticated access for testing
    // TODO: Add proper authentication after wallet integration
    
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return errorResponse('Repository URL is required');
    }

    // Check cache first
    const cacheKey = `repo:${repoUrl}`;
    const cached = await redisHelpers.getRepo(cacheKey);
    if (cached) {
      return successResponse(cached, 'Retrieved from cache');
    }

    // Parse and fetch repository
    const githubService = new GitHubService();
    const parsed = githubService.parseRepoUrl(repoUrl);

    if (!parsed) {
      return errorResponse('Invalid GitHub URL');
    }

    const { owner, repo } = parsed;

    // Fetch repository data first (need branch for file tree)
    const repoData = await githubService.getRepository(owner, repo);
    
    // Then fetch file tree and languages in parallel
    const [fileTree, languages] = await Promise.all([
      githubService.getFileTree(owner, repo, repoData.branch),
      githubService.getLanguages(owner, repo),
    ]);

    // Get sample files for analysis
    const sampleFiles = await githubService.getMultipleFiles(
      owner,
      repo,
      ['README.md', 'package.json', 'src/index.ts', 'src/index.js', 'main.py'].filter(Boolean),
      repoData.branch
    );

    // Run AI analysis (optional - skip if no API key)
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
        console.error('AI analysis failed (skipping):', error.message);
        // Continue without AI analysis
      }
    }

    const result = {
      repo: repoData,
      fileTree,
      languages,
      analysis,
    };

    // Cache result
    await redisHelpers.cacheRepo(cacheKey, result, 3600); // 1 hour

    return successResponse(result);
  } catch (error: any) {
    console.error('GitHub analyze error:', error);
    return errorResponse(error.message || 'Failed to analyze repository', 500);
  }
}
