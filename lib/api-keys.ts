import crypto from 'crypto';
import prisma from './prisma';

// Generate a secure API key
export function generateApiKey(prefix: string = 'unrepo'): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('base64url');
  return `${prefix}_${key}`;
}

// Validate API key format
export function isValidApiKeyFormat(key: string): boolean {
  return /^unrepo_[A-Za-z0-9_-]{43}$/.test(key);
}

// Hash API key for storage
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Verify API key
export async function verifyApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  type?: 'RESEARCH' | 'CHATBOT';
  rateLimit?: number;
}> {
  try {
    if (!isValidApiKeyFormat(key)) {
      return { valid: false };
    }

    const hashedKey = hashApiKey(key);
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { user: true },
    });

    if (!apiKey || !apiKey.isActive) {
      return { valid: false };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false };
    }

    // Update usage
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return {
      valid: true,
      userId: apiKey.userId,
      type: apiKey.type,
      rateLimit: apiKey.rateLimit,
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return { valid: false };
  }
}

// Create API key for user
export async function createApiKey(
  userId: string,
  type: 'RESEARCH' | 'CHATBOT',
  name?: string,
  expiresInDays?: number
): Promise<{ key: string; id: string }> {
  const key = generateApiKey();
  const hashedKey = hashApiKey(key);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      key: hashedKey,
      type,
      name,
      expiresAt,
    },
  });

  // Return the plain key (only time it's visible)
  return {
    key,
    id: apiKey.id,
  };
}

// Revoke API key
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  try {
    await prisma.apiKey.update({
      where: {
        id: keyId,
        userId, // Ensure user owns the key
      },
      data: {
        isActive: false,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Get user's API keys
export async function getUserApiKeys(userId: string) {
  return await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      usageCount: true,
      rateLimit: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      // Don't return the actual key
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Generate NextAuth secret
export function generateNextAuthSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Utility to check rate limit for API key
export async function checkApiKeyRateLimit(
  keyId: string,
  redisClient: any
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `api_rate_limit:${keyId}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

  // Get API key rate limit
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
    select: { rateLimit: true },
  });

  if (!apiKey) {
    return { allowed: false, remaining: 0, resetAt };
  }

  const limit = apiKey.rateLimit;

  // Check current usage from Redis
  const current = await redisClient.get(key);
  const usage = current ? parseInt(current) : 0;

  if (usage >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Increment usage
  await redisClient.incr(key);
  await redisClient.expire(key, Math.ceil(windowMs / 1000));

  return {
    allowed: true,
    remaining: limit - usage - 1,
    resetAt,
  };
}
