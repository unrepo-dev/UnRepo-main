import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error('REDIS_URL is not defined');
};

// Parse Redis URL or use direct connection
const redisUrl = getRedisUrl();

// Check if it's a Redis Labs URL format
const isRedisLabsUrl = redisUrl.includes('redislabs.com');

export const redis = isRedisLabsUrl
  ? new Redis({
      host: 'redis-17991.c323.us-east-1-2.ec2.cloud.redislabs.com',
      port: 17991,
      username: 'default',
      password: 'EarPIvh45NDY6SbLnkNTX8Gvc3bjjZU2',
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 10000,
    })
  : new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 10000,
    });

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis client ready');
});

// Helper functions for common operations
export const redisHelpers = {
  // Cache GitHub repository data
  async cacheRepo(repoKey: string, data: any, expirySeconds: number = 3600) {
    await redis.setex(repoKey, expirySeconds, JSON.stringify(data));
  },

  async getRepo(repoKey: string) {
    const data = await redis.get(repoKey);
    return data ? JSON.parse(data) : null;
  },

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number = 3600): Promise<boolean> {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    return current <= limit;
  },

  async getRateLimitInfo(key: string): Promise<{ count: number; ttl: number }> {
    const [count, ttl] = await Promise.all([
      redis.get(key),
      redis.ttl(key),
    ]);
    
    return {
      count: count ? parseInt(count) : 0,
      ttl: ttl || 0,
    };
  },

  // Chat session management
  async saveChatMessage(sessionId: string, message: any) {
    const key = `chat:${sessionId}`;
    await redis.rpush(key, JSON.stringify(message));
    await redis.expire(key, 86400); // 24 hours
  },

  async getChatHistory(sessionId: string, limit: number = 50) {
    const key = `chat:${sessionId}`;
    const messages = await redis.lrange(key, -limit, -1);
    return messages.map((msg) => JSON.parse(msg));
  },

  async getChatMessageCount(userId: string, sessionId: string): Promise<number> {
    const key = `chat:count:${userId}:${sessionId}`;
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
  },

  async incrementChatCount(userId: string, sessionId: string): Promise<number> {
    const key = `chat:count:${userId}:${sessionId}`;
    const count = await redis.incr(key);
    await redis.expire(key, 86400); // 24 hours
    return count;
  },

  // Clear cache
  async clearCache(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

export default redis;
