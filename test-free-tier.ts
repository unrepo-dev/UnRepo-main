/**
 * Complete API Flow Test
 * Tests the full user journey: Create API -> Use API -> Hit free tier limit
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testFreeCompleteFlow(apiKey: string, apiType: 'chatbot' | 'research') {
  const endpoint = apiType === 'chatbot' 
    ? 'http://localhost:3000/api/v1/chatbot'
    : 'http://localhost:3000/api/v1/research';

  log(`\n${'='.repeat(70)}`, colors.cyan);
  log(`Testing ${apiType.toUpperCase()} API - Free Tier (5 calls limit)`, colors.cyan);
  log('='.repeat(70), colors.cyan);

  const requestBody = apiType === 'chatbot'
    ? {
        message: 'What is this repository about?',
        repoUrl: 'https://github.com/vercel/next.js',
        conversationHistory: [],
      }
    : {
        repoUrl: 'https://github.com/vercel/next.js',
        options: { includeAnalysis: true },
      };

  // Test first 5 calls (should succeed)
  for (let i = 1; i <= 5; i++) {
    log(`\n📡 Call ${i}/5...`, colors.blue);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        log(`✅ Call ${i}: SUCCESS (Status ${response.status})`, colors.green);
        log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`, colors.reset);
      } else {
        log(`❌ Call ${i}: FAILED (Status ${response.status})`, colors.red);
        log(`   Error: ${data.message}`, colors.red);
        break;
      }
    } catch (error: any) {
      log(`❌ Call ${i}: ERROR`, colors.red);
      log(`   ${error.message}`, colors.red);
      break;
    }

    // Small delay between calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test 6th call (should fail with free tier limit)
  log(`\n📡 Call 6/5 (Should fail - Free tier limit)...`, colors.yellow);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok && data.message.includes('Free tier limit')) {
      log(`✅ Correctly rejected 6th call with free tier limit`, colors.green);
      log(`   Message: ${data.message}`, colors.yellow);
    } else if (response.ok) {
      log(`⚠️  Call 6 succeeded (unexpected - should hit free tier limit)`, colors.yellow);
    } else {
      log(`❌ Call 6 failed with unexpected error`, colors.red);
      log(`   Error: ${data.message}`, colors.red);
    }
  } catch (error: any) {
    log(`❌ Call 6: ERROR`, colors.red);
    log(`   ${error.message}`, colors.red);
  }

  log(`\n${'='.repeat(70)}`, colors.cyan);
  log(`${apiType.toUpperCase()} API Test Complete`, colors.cyan);
  log('='.repeat(70), colors.cyan);
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.magenta);
  log('║     COMPLETE API FLOW TEST - FREE TIER (5 CALLS)         ║', colors.magenta);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.magenta);

  const args = process.argv.slice(2);
  const chatbotKey = args[0];
  const researchKey = args[1];

  if (!chatbotKey && !researchKey) {
    log('❌ No API keys provided', colors.red);
    log('\nUsage:', colors.yellow);
    log('  npm run test:flow <chatbot_key> <research_key>', colors.cyan);
    log('  npm run test:flow <chatbot_key> - (chatbot only)', colors.cyan);
    log('  npm run test:flow - <research_key> (research only)\n', colors.cyan);
    process.exit(1);
  }

  if (chatbotKey && chatbotKey !== '-') {
    await testFreeCompleteFlow(chatbotKey, 'chatbot');
  }

  if (researchKey && researchKey !== '-') {
    await testFreeCompleteFlow(researchKey, 'research');
  }

  log('\n✨ All tests completed!', colors.green);
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
