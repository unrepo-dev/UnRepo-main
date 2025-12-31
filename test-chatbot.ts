async function testChatbotEndpoint() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing POST /api/chatbot endpoint...\n');

  // Test 1: Without authentication (should fail)
  console.log('Test 1: Without authentication');
  try {
    const response = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello',
        sessionId: 'test-session',
      }),
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    console.log(response.status === 401 ? '✅ Correctly rejected\n' : '❌ Should have rejected\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message, '\n');
  }

  // Test 2: With invalid API key (should fail)
  console.log('Test 2: With invalid API key');
  try {
    const response = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'invalid-key-12345',
      },
      body: JSON.stringify({
        message: 'Hello',
        sessionId: 'test-session',
      }),
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    console.log(response.status === 401 || response.status === 500 ? '✅ Correctly rejected\n' : '❌ Should have rejected\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message, '\n');
  }

  // Test 3: OPTIONS request (CORS preflight)
  console.log('Test 3: OPTIONS request (CORS preflight)');
  try {
    const response = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'OPTIONS',
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`CORS Headers:`, {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    });
    console.log(response.status === 200 ? '✅ CORS enabled\n' : '❌ CORS issue\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message, '\n');
  }

  console.log('✅ Endpoint tests complete!');
  console.log('\n📝 Summary:');
  console.log('- POST /api/chatbot requires authentication (API key or session)');
  console.log('- OPTIONS /api/chatbot returns CORS headers');
  console.log('- To test with session, login via browser and use the web interface');
}

testChatbotEndpoint();
