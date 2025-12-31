import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatWithRepository } from '@/lib/ai';
import { redisHelpers } from '@/lib/redis';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';
import { APP_CONFIG } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return errorResponse('Unauthorized - GitHub login required', 401);
    }

    const { message, repoUrl, sessionId } = await request.json();

    if (!message || !sessionId) {
      return errorResponse('Message and sessionId are required');
    }

    // Get user from database
    const user = await prisma.user.findFirst({
      where: { email: session.user.email || '' },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check chat limit
    const messageCount = await redisHelpers.getChatMessageCount(user.id, sessionId);
    
    if (messageCount >= APP_CONFIG.chat.freeUserLimit && !user.isTokenHolder) {
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
    const newCount = await redisHelpers.incrementChatCount(user.id, sessionId);

    // Save to database
    await prisma.chatMessage.createMany({
      data: [
        {
          userId: user.id,
          sessionId,
          role: 'user',
          content: message,
          repoContext: repoUrl,
        },
        {
          userId: user.id,
          sessionId,
          role: 'assistant',
          content: response,
          repoContext: repoUrl,
        },
      ],
    });

    return successResponse({
      response,
      messageCount: newCount,
      remaining: user.isTokenHolder ? 'unlimited' : APP_CONFIG.chat.freeUserLimit - newCount,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return errorResponse(error.message || 'Failed to process chat message', 500);
  }
}
