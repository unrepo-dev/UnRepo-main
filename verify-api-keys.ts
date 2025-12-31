import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyApiKeys() {
  console.log('🔍 Verifying API Keys in Database...\n');

  try {
    // Get all API keys
    const apiKeys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (apiKeys.length === 0) {
      console.log('❌ No API keys found in database\n');
      return;
    }

    console.log(`✅ Found ${apiKeys.length} API key(s) in database\n`);
    console.log('━'.repeat(80));

    apiKeys.forEach((key, index) => {
      console.log(`\n📋 API Key #${index + 1}`);
      console.log('─'.repeat(80));
      console.log(`ID:           ${key.id}`);
      console.log(`Name:         ${key.name || 'N/A'}`);
      console.log(`Type:         ${key.type}`);
      console.log(`Key:          ${key.key.substring(0, 30)}...`);
      console.log(`Active:       ${key.isActive ? '✅' : '❌'}`);
      console.log(`Usage Count:  ${key.usageCount}`);
      console.log(`Last Used:    ${key.lastUsedAt ? key.lastUsedAt.toISOString() : 'Never'}`);
      console.log(`Created:      ${key.createdAt.toISOString()}`);
      console.log(`\nUser:`);
      console.log(`  Email:      ${key.user.email}`);
      console.log(`  Name:       ${key.user.name}`);
    });

    console.log('\n' + '━'.repeat(80));
    console.log('\n📊 Summary by Type:');
    const chatbotCount = apiKeys.filter(k => k.type === 'CHATBOT').length;
    const researchCount = apiKeys.filter(k => k.type === 'RESEARCH').length;
    console.log(`🤖 Chatbot Keys:  ${chatbotCount}`);
    console.log(`🔬 Research Keys: ${researchCount}`);

    const activeCount = apiKeys.filter(k => k.isActive).length;
    console.log(`\n✅ Active Keys:   ${activeCount}/${apiKeys.length}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyApiKeys();
