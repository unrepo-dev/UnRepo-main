import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate API key with unrepo_ prefix
function generateApiKey(type: 'RESEARCH' | 'CHATBOT'): string {
  const prefix = type === 'RESEARCH' ? 'unrepo_research_' : 'unrepo_chatbot_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
}

async function testApiKeyGeneration() {
  try {
    console.log('🔍 Testing API Key Generation...\n');

    // Get or create a test user
    let user = await prisma.user.findFirst({
      where: {
        email: 'test@unrepo.dev'
      }
    });

    if (!user) {
      console.log('📝 Creating test user...');
      user = await prisma.user.create({
        data: {
          email: 'test@unrepo.dev',
          name: 'Test User',
          authMethod: 'GITHUB',
        }
      });
      console.log('✅ Test user created:', user.email);
    } else {
      console.log('✅ Using existing test user:', user.email);
    }

    // Test creating a CHATBOT API key
    console.log('\n🤖 Testing CHATBOT API key generation...');
    const chatbotKey = generateApiKey('CHATBOT');
    
    const chatbotApiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: chatbotKey,
        type: 'CHATBOT',
        name: 'Test Chatbot Key',
        isActive: true,
      }
    });

    console.log('✅ CHATBOT API Key created successfully!');
    console.log('   Key:', chatbotApiKey.key);
    console.log('   Type:', chatbotApiKey.type);
    console.log('   Name:', chatbotApiKey.name);
    console.log('   Created:', chatbotApiKey.createdAt);

    // Test creating a RESEARCH API key
    console.log('\n🔬 Testing RESEARCH API key generation...');
    const researchKey = generateApiKey('RESEARCH');
    
    const researchApiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: researchKey,
        type: 'RESEARCH',
        name: 'Test Research Key',
        isActive: true,
      }
    });

    console.log('✅ RESEARCH API Key created successfully!');
    console.log('   Key:', researchApiKey.key);
    console.log('   Type:', researchApiKey.type);
    console.log('   Name:', researchApiKey.name);
    console.log('   Created:', researchApiKey.createdAt);

    // Fetch all API keys for the user
    console.log('\n📋 All API Keys for user:');
    const allKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\nTotal keys: ${allKeys.length}`);
    allKeys.forEach((key, index) => {
      console.log(`\n${index + 1}. ${key.type} Key:`);
      console.log(`   Name: ${key.name}`);
      console.log(`   Key: ${key.key.substring(0, 30)}...`);
      console.log(`   Active: ${key.isActive}`);
      console.log(`   Usage: ${key.usageCount} calls`);
      console.log(`   Created: ${key.createdAt}`);
    });

    console.log('\n✅ API Key Generation Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiKeyGeneration();
