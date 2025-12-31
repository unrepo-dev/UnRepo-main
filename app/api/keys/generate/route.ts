import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';
import crypto from 'crypto';

// Generate API key with unrepo_ prefix
function generateApiKey(type: 'RESEARCH' | 'CHATBOT'): string {
  const prefix = type === 'RESEARCH' ? 'unrepo_research_' : 'unrepo_chatbot_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const userId = (session.user as any).id;
    
    if (!userId) {
      return errorResponse('User session invalid', 401);
    }

    const { type, name } = await request.json();

    if (!type || !['RESEARCH', 'CHATBOT'].includes(type)) {
      return errorResponse('Invalid API key type. Must be RESEARCH or CHATBOT');
    }

    if (!name || name.trim().length === 0) {
      return errorResponse('API name is required');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if user already has this type of API key
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        userId: user.id,
        type,
        isActive: true,
      },
    });

    if (existingKey) {
      return successResponse({
        apiKey: existingKey.key,
        type: existingKey.type,
        createdAt: existingKey.createdAt,
        isActive: existingKey.isActive,
      }, 'API key already exists');
    }

    // Generate new API key
    const apiKey = generateApiKey(type as 'RESEARCH' | 'CHATBOT');

    // Save to database
    const newKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: apiKey,
        type,
        name: name.trim(),
        isActive: true,
      },
    });

    return successResponse({
      apiKey: newKey.key,
      type: newKey.type,
      createdAt: newKey.createdAt,
      isActive: newKey.isActive,
    }, 'API key generated successfully');
  } catch (error: any) {
    console.error('API key generation error:', error);
    return errorResponse(error.message || 'Failed to generate API key', 500);
  }
}

// Get user's API keys
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const userId = (session.user as any).id;
    
    if (!userId) {
      return errorResponse('User session invalid', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        apiKeys: {
          where: { isActive: true },
          select: {
            id: true,
            key: true,
            name: true,
            type: true,
            createdAt: true,
            lastUsedAt: true,
            usageCount: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Add user info to each API key
    const keysWithUserInfo = user.apiKeys.map(key => ({
      ...key,
      user: {
        paymentVerified: user.paymentVerified,
        isTokenHolder: user.isTokenHolder,
      },
    }));

    return successResponse({
      keys: keysWithUserInfo,
    });
  } catch (error: any) {
    console.error('Get API keys error:', error);
    return errorResponse(error.message || 'Failed to get API keys', 500);
  }
}
