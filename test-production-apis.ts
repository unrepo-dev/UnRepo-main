/**
 * Production API Testing Script
 * Tests both Chatbot and Research APIs with proper error handling
 */

const ENDPOINTS = {
  chatbot: 'http://localhost:3000/api/v1/chatbot',
  research: 'http://localhost:3000/api/v1/research',
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testChatbotAPI(apiKey: string) {
  log('\n🤖 Testing Chatbot API...', colors.cyan);
  log('━'.repeat(60), colors.blue);

  try {
    const response = await fetch(ENDPOINTS.chatbot, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        message: 'What is this repository about?',
        repoUrl: 'https://github.com/vercel/next.js',
        conversationHistory: [],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Chatbot API: SUCCESS', colors.green);
      log(`Status: ${response.status}`, colors.green);
      log(`Response: ${JSON.stringify(data, null, 2).substring(0, 500)}...`, colors.reset);
      
      // Check rate limit headers
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      if (rateLimit) {
        log(`\nRate Limits:`, colors.yellow);
        log(`  Limit: ${rateLimit}`, colors.yellow);
        log(`  Remaining: ${remaining}`, colors.yellow);
        log(`  Reset: ${reset ? new Date(parseInt(reset)).toISOString() : 'N/A'}`, colors.yellow);
      }
    } else {
      log('❌ Chatbot API: FAILED', colors.red);
      log(`Status: ${response.status}`, colors.red);
      log(`Error: ${JSON.stringify(data, null, 2)}`, colors.red);
    }
  } catch (error: any) {
    log('❌ Chatbot API: ERROR', colors.red);
    log(`Error: ${error.message}`, colors.red);
  }
}

async function testResearchAPI(apiKey: string) {
  log('\n🔬 Testing Research API...', colors.cyan);
  log('━'.repeat(60), colors.blue);

  try {
    const response = await fetch(ENDPOINTS.research, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/vercel/next.js',
        options: {
          includeAnalysis: true,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Research API: SUCCESS', colors.green);
      log(`Status: ${response.status}`, colors.green);
      log(`Response: ${JSON.stringify(data, null, 2).substring(0, 500)}...`, colors.reset);
      
      // Check rate limit headers
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      if (rateLimit) {
        log(`\nRate Limits:`, colors.yellow);
        log(`  Limit: ${rateLimit}`, colors.yellow);
        log(`  Remaining: ${remaining}`, colors.yellow);
        log(`  Reset: ${reset ? new Date(parseInt(reset)).toISOString() : 'N/A'}`, colors.yellow);
      }
    } else {
      log('❌ Research API: FAILED', colors.red);
      log(`Status: ${response.status}`, colors.red);
      log(`Error: ${JSON.stringify(data, null, 2)}`, colors.red);
    }
  } catch (error: any) {
    log('❌ Research API: ERROR', colors.red);
    log(`Error: ${error.message}`, colors.red);
  }
}

async function testCORS() {
  log('\n🌐 Testing CORS...', colors.cyan);
  log('━'.repeat(60), colors.blue);

  try {
    const response = await fetch(ENDPOINTS.chatbot, {
      method: 'OPTIONS',
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };

    if (corsHeaders['Access-Control-Allow-Origin']) {
      log('✅ CORS: Properly configured', colors.green);
      log(`Headers: ${JSON.stringify(corsHeaders, null, 2)}`, colors.reset);
    } else {
      log('⚠️  CORS: Headers missing', colors.yellow);
    }
  } catch (error: any) {
    log('❌ CORS: ERROR', colors.red);
    log(`Error: ${error.message}`, colors.red);
  }
}

async function testInvalidKey() {
  log('\n🔒 Testing Invalid API Key...', colors.cyan);
  log('━'.repeat(60), colors.blue);

  try {
    const response = await fetch(ENDPOINTS.chatbot, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'unrepo_chatbot_invalid_key_12345',
      },
      body: JSON.stringify({
        message: 'Test',
        repoUrl: 'https://github.com/vercel/next.js',
      }),
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      log('✅ Security: Properly rejecting invalid keys', colors.green);
      log(`Status: ${response.status}`, colors.green);
      log(`Message: ${data.message}`, colors.reset);
    } else {
      log('⚠️  Security: Unexpected response', colors.yellow);
      log(`Status: ${response.status}`, colors.yellow);
      log(`Data: ${JSON.stringify(data, null, 2)}`, colors.reset);
    }
  } catch (error: any) {
    log('❌ Security Test: ERROR', colors.red);
    log(`Error: ${error.message}`, colors.red);
  }
}

async function testMissingKey() {
  log('\n🔒 Testing Missing API Key...', colors.cyan);
  log('━'.repeat(60), colors.blue);

  try {
    const response = await fetch(ENDPOINTS.research, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/vercel/next.js',
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      log('✅ Security: Properly requiring API keys', colors.green);
      log(`Status: ${response.status}`, colors.green);
      log(`Message: ${data.message}`, colors.reset);
    } else {
      log('⚠️  Security: Unexpected response', colors.yellow);
      log(`Status: ${response.status}`, colors.yellow);
    }
  } catch (error: any) {
    log('❌ Security Test: ERROR', colors.red);
    log(`Error: ${error.message}`, colors.red);
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║       UNREPO PRODUCTION API TEST SUITE                    ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);

  // Get API keys from command line arguments
  const args = process.argv.slice(2);
  const chatbotKey = args[0];
  const researchKey = args[1];

  if (!chatbotKey && !researchKey) {
    log('\n⚠️  No API keys provided. Running security tests only.\n', colors.yellow);
    log('Usage: npm run test:apis <chatbot_key> <research_key>', colors.yellow);
    log('Or:    npm run test:apis <chatbot_key> (for chatbot only)', colors.yellow);
    log('Or:    npm run test:apis - <research_key> (for research only)\n', colors.yellow);
    
    await testCORS();
    await testMissingKey();
    await testInvalidKey();
    
    log('\n✨ Security tests completed!', colors.cyan);
    log('━'.repeat(60), colors.blue);
    return;
  }

  // Run tests
  await testCORS();
  await testMissingKey();
  await testInvalidKey();

  if (chatbotKey && chatbotKey !== '-') {
    await testChatbotAPI(chatbotKey);
  }

  if (researchKey && researchKey !== '-') {
    await testResearchAPI(researchKey);
  }

  log('\n✨ All tests completed!', colors.cyan);
  log('━'.repeat(60), colors.blue);
}

main().catch(console.error);
