import { NextRequest } from 'next/server';
import GitHubService from '@/lib/github';
import { successResponse, errorResponse } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, path, branch } = await request.json();

    if (!owner || !repo || !path) {
      return errorResponse('Missing required parameters');
    }

    const githubService = new GitHubService();
    const content = await githubService.getFileContent(owner, repo, path, branch || 'main');

    return successResponse({ content, path });
  } catch (error: any) {
    console.error('GitHub file fetch error:', error);
    return errorResponse(error.message || 'Failed to fetch file', 500);
  }
}
