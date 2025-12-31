/**
 * Test intelligent AI routing
 */

import dotenv from 'dotenv';
dotenv.config();

import { chatWithRepository } from './lib/ai';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function testRouting() {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}🧪 Testing Intelligent AI Routing${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const repoContext = {
    repoUrl: 'https://github.com/vercel/next.js',
    repoOwner: 'vercel',
    repoName: 'next.js',
    files: [],
  };

  // Test 1: Code question (should use Claude)
  console.log(`${colors.yellow}Test 1: Code Question (expects Claude)${colors.reset}`);
  console.log('Question: "Explain how the Link component works in Next.js"');
  try {
    const response1 = await chatWithRepository(
      [{ role: 'user', content: 'Explain how the Link component works in Next.js' }],
      repoContext
    );
    console.log(`${colors.green}✅ Response received${colors.reset}`);
    console.log(`Response: ${response1.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`${colors.yellow}⚠️  ${error.message}${colors.reset}\n`);
  }

  // Test 2: Project analysis (should use ChatGPT)
  console.log(`${colors.yellow}Test 2: Project Analysis (expects ChatGPT)${colors.reset}`);
  console.log('Question: "Is this project a rug pull? What are the security risks?"');
  try {
    const response2 = await chatWithRepository(
      [{ role: 'user', content: 'Is this project a rug pull? What are the security risks?' }],
      repoContext
    );
    console.log(`${colors.green}✅ Response received${colors.reset}`);
    console.log(`Response: ${response2.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`${colors.yellow}⚠️  ${error.message}${colors.reset}\n`);
  }

  // Test 3: Utility question (should use ChatGPT)
  console.log(`${colors.yellow}Test 3: Utility Question (expects ChatGPT)${colors.reset}`);
  console.log('Question: "What is the utility of this project?"');
  try {
    const response3 = await chatWithRepository(
      [{ role: 'user', content: 'What is the utility of this project?' }],
      repoContext
    );
    console.log(`${colors.green}✅ Response received${colors.reset}`);
    console.log(`Response: ${response3.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`${colors.yellow}⚠️  ${error.message}${colors.reset}\n`);
  }

  // Test 4: Debug question (should use Claude)
  console.log(`${colors.yellow}Test 4: Debug Question (expects Claude)${colors.reset}`);
  console.log('Question: "How do I fix hydration errors in Next.js?"');
  try {
    const response4 = await chatWithRepository(
      [{ role: 'user', content: 'How do I fix hydration errors in Next.js?' }],
      repoContext
    );
    console.log(`${colors.green}✅ Response received${colors.reset}`);
    console.log(`Response: ${response4.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`${colors.yellow}⚠️  ${error.message}${colors.reset}\n`);
  }

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}✅ Routing test completed!${colors.reset}`);
}

testRouting().catch(console.error);
