/**
 * AI API Testing Script
 * Tests both Claude (Anthropic) and ChatGPT (OpenAI) APIs
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

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

// Test 1: Claude (Anthropic) API
async function testClaudeAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('🤖 Testing Claude API (Anthropic)', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-anthropic-api-key') {
    log('\n❌ ANTHROPIC_API_KEY not set in .env', colors.red);
    return false;
  }

  log(`\n🔑 API Key: ${apiKey.substring(0, 20)}...${apiKey.slice(-4)}`);

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    log('\n📤 Sending test message to Claude...');
    
    const startTime = Date.now();
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "Claude API is working!" in exactly 5 words.',
        },
      ],
    });
    const endTime = Date.now();

    log(`\n📥 Response received in ${endTime - startTime}ms`);
    log(`📊 Model: ${message.model}`);
    log(`🔢 Tokens used: ${message.usage.input_tokens} input, ${message.usage.output_tokens} output`);
    log(`\n💬 Claude's response:`, colors.green);
    console.log(message.content[0].type === 'text' ? message.content[0].text : message.content[0]);

    log('\n✅ Claude API is working perfectly!', colors.green);
    return true;
  } catch (error: any) {
    log('\n❌ Claude API test failed:', colors.red);
    log(`Error: ${error.message}`, colors.red);
    if (error.status) {
      log(`Status: ${error.status}`, colors.red);
    }
    return false;
  }
}

// Test 2: ChatGPT (OpenAI) API
async function testOpenAIAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('🤖 Testing ChatGPT API (OpenAI)', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key') {
    log('\n❌ OPENAI_API_KEY not set in .env', colors.red);
    return false;
  }

  log(`\n🔑 API Key: ${apiKey.substring(0, 20)}...${apiKey.slice(-4)}`);

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    log('\n📤 Sending test message to ChatGPT...');
    
    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "ChatGPT API is working!" in exactly 5 words.',
        },
      ],
    });
    const endTime = Date.now();

    log(`\n📥 Response received in ${endTime - startTime}ms`);
    log(`📊 Model: ${response.model}`);
    log(`🔢 Tokens used: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output`);
    log(`\n💬 ChatGPT's response:`, colors.green);
    console.log(response.choices[0].message.content);

    log('\n✅ ChatGPT API is working perfectly!', colors.green);
    return true;
  } catch (error: any) {
    log('\n❌ ChatGPT API test failed:', colors.red);
    log(`Error: ${error.message}`, colors.red);
    if (error.status) {
      log(`Status: ${error.status}`, colors.red);
    }
    return false;
  }
}

// Test 3: Code Analysis with Claude
async function testClaudeCodeAnalysis() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('🔍 Testing Claude Code Analysis', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    log('\n⏭️  Skipping (no API key)', colors.yellow);
    return false;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const sampleCode = `
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
`;

    log('\n📤 Asking Claude to analyze code...');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Analyze this code and give a quality score (0-10):\n${sampleCode}`,
        },
      ],
    });

    log(`\n💬 Claude's analysis:`, colors.green);
    console.log(message.content[0].type === 'text' ? message.content[0].text : message.content[0]);

    log('\n✅ Claude code analysis working!', colors.green);
    return true;
  } catch (error: any) {
    log('\n❌ Claude code analysis failed:', colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Test 4: Chat with OpenAI
async function testOpenAIChat() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('💬 Testing ChatGPT Conversational Chat', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    log('\n⏭️  Skipping (no API key)', colors.yellow);
    return false;
  }

  try {
    const openai = new OpenAI({ apiKey });

    log('\n📤 Starting conversation with ChatGPT...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful code assistant for analyzing GitHub repositories.',
        },
        {
          role: 'user',
          content: 'What should I look for when analyzing a GitHub repository for security issues?',
        },
      ],
    });

    log(`\n💬 ChatGPT's response:`, colors.green);
    console.log(response.choices[0].message.content);

    log('\n✅ ChatGPT conversational chat working!', colors.green);
    return true;
  } catch (error: any) {
    log('\n❌ ChatGPT chat failed:', colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║   UnRepo AI APIs Testing Suite        ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);

  const results = {
    claude: false,
    openai: false,
    claudeAnalysis: false,
    openaiChat: false,
  };

  // Basic API tests
  results.claude = await testClaudeAPI();
  results.openai = await testOpenAIAPI();

  // Advanced feature tests
  if (results.claude) {
    results.claudeAnalysis = await testClaudeCodeAnalysis();
  }
  
  if (results.openai) {
    results.openaiChat = await testOpenAIChat();
  }

  // Summary
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║           Test Summary                 ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);
  
  log(`\n${results.claude ? '✅' : '❌'} Claude API (Research)`, results.claude ? colors.green : colors.red);
  log(`${results.openai ? '✅' : '❌'} ChatGPT API (Chat)`, results.openai ? colors.green : colors.red);
  log(`${results.claudeAnalysis ? '✅' : '❌'} Claude Code Analysis`, results.claudeAnalysis ? colors.green : colors.red);
  log(`${results.openaiChat ? '✅' : '❌'} ChatGPT Conversation`, results.openaiChat ? colors.green : colors.red);

  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n🎉 All AI APIs are working perfectly!', colors.green);
    log('✅ Ready to build UnRepo API infrastructure', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check your API keys in .env', colors.yellow);
  }

  log('\n');
}

// Run tests
runAllTests().catch(console.error);
