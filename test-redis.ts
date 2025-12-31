// Redis Connection Test Script
import 'dotenv/config';
import { redis, redisHelpers } from './lib/redis';

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // Test 1: Basic ping
    console.log('Test 1: Ping');
    const pong = await redis.ping();
    console.log('✅ Ping response:', pong);

    // Test 2: Set and Get
    console.log('\nTest 2: Set and Get');
    await redis.set('test:foo', 'bar');
    const result = await redis.get('test:foo');
    console.log('✅ Set and Get:', result);

    // Test 3: Cache helper
    console.log('\nTest 3: Cache Helper');
    await redisHelpers.cacheRepo('test:repo:unrepo', { name: 'UnRepo', stars: 1000 }, 60);
    const cachedRepo = await redisHelpers.getRepo('test:repo:unrepo');
    console.log('✅ Cached repo:', cachedRepo);

    // Test 4: Rate limiting
    console.log('\nTest 4: Rate Limiting');
    const canProceed1 = await redisHelpers.checkRateLimit('test:user:123', 5, 60);
    const canProceed2 = await redisHelpers.checkRateLimit('test:user:123', 5, 60);
    const rateLimitInfo = await redisHelpers.getRateLimitInfo('test:user:123');
    console.log('✅ Rate limit check 1:', canProceed1);
    console.log('✅ Rate limit check 2:', canProceed2);
    console.log('✅ Rate limit info:', rateLimitInfo);

    // Test 5: Chat message counting
    console.log('\nTest 5: Chat Message Counting');
    const count1 = await redisHelpers.incrementChatCount('user123', 'session456');
    const count2 = await redisHelpers.incrementChatCount('user123', 'session456');
    const totalCount = await redisHelpers.getChatMessageCount('user123', 'session456');
    console.log('✅ Chat count after increment 1:', count1);
    console.log('✅ Chat count after increment 2:', count2);
    console.log('✅ Total chat messages:', totalCount);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await redis.del('test:foo', 'test:repo:unrepo', 'test:user:123', 'chat:count:user123:session456');
    console.log('✅ Cleanup complete');

    console.log('\n✅ All Redis tests passed!');
    console.log('🎉 Redis cloud connection is working perfectly!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRedisConnection();
