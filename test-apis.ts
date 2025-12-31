/**
 * API Testing Script
 * Tests both Research API and Chatbot API
 */

const BASE_URL = 'http://localhost:3000';

// Test colors
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

// Test 1: Research API
async function testResearchAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('📊 Testing Research API', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-key-123', // Will fail but we want to see the error response
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/vercel/next.js',
      }),
    });

    const data = await response.json();
    
    log(`\n📍 Endpoint: POST /api/research`);
    log(`🔢 Status: ${response.status}`);
    log(`📦 Response:`, colors.yellow);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401) {
      log('\n✅ Research API is responding (needs valid API key)', colors.green);
    } else if (response.ok) {
      log('\n✅ Research API is working!', colors.green);
    } else {
      log('\n⚠️  Research API returned an error', colors.yellow);
    }
  } catch (error: any) {
    log('\n❌ Research API test failed:', colors.red);
    log(error.message, colors.red);
  }
}

// Test 2: Chatbot API (without auth - should fail gracefully)
async function testChatbotAPINoAuth() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('💬 Testing Chatbot API (No Auth)', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, what is Next.js?',
        repoUrl: 'https://github.com/vercel/next.js',
        sessionId: 'test-session-123',
      }),
    });

    const data = await response.json();
    
    log(`\n📍 Endpoint: POST /api/chatbot`);
    log(`🔢 Status: ${response.status}`);
    log(`📦 Response:`, colors.yellow);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401) {
      log('\n✅ Chatbot API is responding (needs authentication)', colors.green);
    } else if (response.ok) {
      log('\n✅ Chatbot API is working!', colors.green);
    } else {
      log('\n⚠️  Chatbot API returned an error', colors.yellow);
    }
  } catch (error: any) {
    log('\n❌ Chatbot API test failed:', colors.red);
    log(error.message, colors.red);
  }
}

// Test 3: Chatbot API (with API key)
async function testChatbotAPIWithKey() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('💬 Testing Chatbot API (With API Key)', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-key-123',
      },
      body: JSON.stringify({
        message: 'Hello, what is Next.js?',
        repoUrl: 'https://github.com/vercel/next.js',
        sessionId: 'test-session-123',
      }),
    });

    const data = await response.json();
    
    log(`\n📍 Endpoint: POST /api/chatbot`);
    log(`🔢 Status: ${response.status}`);
    log(`📦 Response:`, colors.yellow);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401 && data.error?.includes('Invalid')) {
      log('\n✅ Chatbot API is validating API keys correctly', colors.green);
    } else if (response.ok) {
      log('\n✅ Chatbot API is working with API key!', colors.green);
    } else {
      log('\n⚠️  Chatbot API returned an error', colors.yellow);
    }
  } catch (error: any) {
    log('\n❌ Chatbot API test failed:', colors.red);
    log(error.message, colors.red);
  }
}

// Test 4: Check CORS headers
async function testCORS() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('🌐 Testing CORS Headers', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/research`, {
      method: 'OPTIONS',
    });

    log(`\n📍 Endpoint: OPTIONS /api/research`);
    log(`🔢 Status: ${response.status}`);
    log(`📦 CORS Headers:`, colors.yellow);
    console.log({
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });

    if (response.headers.get('Access-Control-Allow-Origin')) {
      log('\n✅ CORS is configured', colors.green);
    } else {
      log('\n⚠️  CORS headers not found', colors.yellow);
    }
  } catch (error: any) {
    log('\n❌ CORS test failed:', colors.red);
    log(error.message, colors.red);
  }
}

// Run all tests
async function runAllTests() {
  log('╔══════════════════════════════════════════╗', colors.blue);
  log('║     UnRepo API Testing Suite             ║', colors.blue);
  log('╚══════════════════════════════════════════╝', colors.blue);
  
  await testResearchAPI();
  await testChatbotAPINoAuth();
  await testChatbotAPIWithKey();
  await testCORS();

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('✨ All tests completed!', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.blue);
}

// Run tests
runAllTests().catch(console.error);
