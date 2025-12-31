/**
 * Setup Script - Generate Test API Keys
 * Creates both Chatbot and Research API keys for testing
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate secure API key
function generateApiKey(type: 'chatbot' | 'research'): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const prefix = type === 'chatbot' ? 'unrepo_chatbot_' : 'unrepo_research_';
  return `${prefix}${randomBytes}`;
}

async function setupTestKeys() {
  console.log('🔧 Setting up test API keys...\n');

  try {
    // Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: {
        email: 'test@unrepo.dev',
      },
    });

    if (!testUser) {
      console.log('📝 Creating test user...');
      testUser = await prisma.user.create({
        data: {
          email: 'test@unrepo.dev',
          name: 'Test User',
          authMethod: 'GITHUB',
          paymentVerified: true,
        },
      });
      console.log('✅ Test user created\n');
    } else {
      console.log('✅ Test user found\n');
    }

    // Generate Chatbot API Key
    console.log('🤖 Generating Chatbot API Key...');
    const chatbotKey = generateApiKey('chatbot');
    
    const chatbotApiKey = await prisma.apiKey.create({
      data: {
        userId: testUser.id,
        key: chatbotKey,
        name: 'Test Chatbot Key',
        type: 'CHATBOT',
        isActive: true,
      },
    });

    console.log('✅ Chatbot API Key created');
    console.log(`   ID: ${chatbotApiKey.id}`);
    console.log(`   Key: ${chatbotKey}`);
    console.log(`   Type: ${chatbotApiKey.type}`);
    console.log(`   Active: ${chatbotApiKey.isActive}\n`);

    // Generate Research API Key
    console.log('🔬 Generating Research API Key...');
    const researchKey = generateApiKey('research');
    
    const researchApiKey = await prisma.apiKey.create({
      data: {
        userId: testUser.id,
        key: researchKey,
        name: 'Test Research Key',
        type: 'RESEARCH',
        isActive: true,
      },
    });

    console.log('✅ Research API Key created');
    console.log(`   ID: ${researchApiKey.id}`);
    console.log(`   Key: ${researchKey}`);
    console.log(`   Type: ${researchApiKey.type}`);
    console.log(`   Active: ${researchApiKey.isActive}\n`);

    // Display summary
    console.log('━'.repeat(70));
    console.log('📋 API Keys Summary\n');
    console.log('🤖 Chatbot API Key:');
    console.log(`   ${chatbotKey}\n`);
    console.log('🔬 Research API Key:');
    console.log(`   ${researchKey}\n`);
    console.log('━'.repeat(70));
    console.log('\n🧪 Test your APIs with:');
    console.log(`   npm run test:apis ${chatbotKey} ${researchKey}\n`);
    console.log('📖 Or test individually:');
    console.log(`   npm run test:apis ${chatbotKey} - (Chatbot only)`);
    console.log(`   npm run test:apis - ${researchKey} (Research only)\n`);

    // Save keys to a file for easy access
    const fs = require('fs');
    const keysFile = `# Test API Keys
# Generated: ${new Date().toISOString()}

CHATBOT_API_KEY=${chatbotKey}
RESEARCH_API_KEY=${researchKey}

# Test Commands:
# npm run test:apis ${chatbotKey} ${researchKey}

# cURL Examples:

# Chatbot API:
curl -X POST http://localhost:3000/api/v1/chatbot \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${chatbotKey}" \\
  -d '{
    "message": "What is this repository about?",
    "repoUrl": "https://github.com/vercel/next.js"
  }'

# Research API:
curl -X POST http://localhost:3000/api/v1/research \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${researchKey}" \\
  -d '{
    "repoUrl": "https://github.com/vercel/next.js"
  }'
`;

    fs.writeFileSync('.api-keys', keysFile);
    console.log('💾 Keys saved to .api-keys file\n');

  } catch (error: any) {
    console.error('❌ Error setting up test keys:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestKeys().catch((error) => {
  console.error(error);
  process.exit(1);
});
