import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return errorResponse('User session invalid', 401);
    }

    // Get all API keys for the user
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        key: true,
        type: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get usage statistics grouped by endpoint
    const usage = await prisma.apiUsage.groupBy({
      by: ['endpoint', 'method'],
      where: { userId },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const formattedUsage = usage.map(u => ({
      endpoint: u.endpoint,
      method: u.method,
      count: u._count.id,
      lastUsed: u._max.createdAt,
    }));

    // Get total usage count
    const totalUsage = await prisma.apiUsage.count({
      where: { userId },
    });

    // Get usage in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsage = await prisma.apiUsage.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    return successResponse({
      keys: apiKeys,
      usage: formattedUsage,
      stats: {
        totalRequests: totalUsage,
        last24Hours: recentUsage,
      },
    });
  } catch (error: any) {
    console.error('Usage stats error:', error);
    return errorResponse(error.message || 'Failed to fetch usage statistics', 500);
  }
}
