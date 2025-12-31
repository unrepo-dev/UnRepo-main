'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardClasses, getCodeBlockClasses, getTextClasses, getAlertClasses } from '@/lib/themeUtils';

export default function ApiDocsPage() {
  const { theme } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          className="mb-12"
        >
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-red-500 mb-4"
          >
            API Documentation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-lg ${getTextClasses(theme, 'secondary')}`}
          >
            Integrate UnRepo's powerful code analysis into your applications
          </motion.p>
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex gap-4"
          >
            <motion.a 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="/developer" 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white shadow-lg hover:shadow-red-600/50"
            >
              Get API Keys
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="#rate-limits" 
              className={`px-4 py-2 border border-red-600 rounded-lg transition ${
                theme === 'dark' ? 'hover:bg-red-600/10' : 'hover:bg-red-50'
              }`}
            >
              View Rate Limits
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Base URL */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Base URLs</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`${getCardClasses(theme)} p-6 rounded-lg`}
          >
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-semibold mb-2 ${getTextClasses(theme)}`}>Chatbot API</p>
                <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
                  <code className="text-blue-400">https://chat.unrepo.dev/api/v1</code>
                </pre>
              </div>
              <div>
                <p className={`text-sm font-semibold mb-2 ${getTextClasses(theme)}`}>Research API</p>
                <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
                  <code className="text-blue-400">https://research.unrepo.dev/api/v1</code>
                </pre>
              </div>
            </div>
            <p className={`mt-4 text-sm ${getTextClasses(theme, 'secondary')}`}>
              All API endpoints are versioned. Current version: <span className="text-red-400 font-semibold">v1</span>
            </p>
          </motion.div>
        </motion.section>

        {/* Authentication */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`${getCardClasses(theme)} p-6 rounded-lg`}
          >
            <p className={`mb-4 ${getTextClasses(theme)}`}>
              All API requests require an API key with the <code className={`px-2 py-1 rounded text-red-400 ${
                theme === 'dark' ? 'bg-black' : 'bg-gray-100'
              }`}>unrepo_</code> prefix.
              Include it in the request header:
            </p>
            <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
              <code className="text-red-400">x-api-key: unrepo_research_YOUR_KEY_HERE</code>
            </pre>
            <div className={`mt-4 space-y-2 text-sm ${getTextClasses(theme, 'secondary')}`}>
              <p>• <span className="text-red-400 font-mono">unrepo_research_</span> - For Research API endpoints</p>
              <p>• <span className="text-red-400 font-mono">unrepo_chatbot_</span> - For Chatbot API endpoints</p>
            </div>
            <p className={`mt-4 text-sm ${getTextClasses(theme, 'secondary')}`}>
              Generate your API keys from the <a href="/developer" className="text-red-400 underline">Developer Portal</a> after logging in with GitHub.
            </p>
          </motion.div>
        </motion.section>

        {/* Rate Limits */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12" 
          id="rate-limits"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Rate Limits</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`${getCardClasses(theme)} p-6 rounded-lg`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'} rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Free Tier</h3>
                <div className={`space-y-2 text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <p>• Research API: <span className={`${getTextClasses(theme)} font-semibold`}>100 requests/hour</span></p>
                  <p>• Chatbot API: <span className={`${getTextClasses(theme)} font-semibold`}>200 requests/hour</span></p>
                </div>
              </div>
              <div className={`${theme === 'dark' ? 'border border-red-600 bg-red-600/5' : 'border border-red-300 bg-red-50'} rounded-lg p-4`}>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Token Holders</h3>
                <div className={`space-y-2 text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <p>• All APIs: <span className="text-red-400 font-semibold">500 requests/hour</span></p>
                  <p>• Priority support</p>
                </div>
              </div>
            </div>
            <div className={`mt-6 ${getCodeBlockClasses(theme)} p-4 rounded-lg`}>
              <p className={`text-sm ${getTextClasses(theme, 'secondary')} mb-2`}>Rate limit headers in responses:</p>
              <pre className={`text-xs ${getTextClasses(theme, 'secondary')}`}>
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200`}
              </pre>
            </div>
          </motion.div>
        </motion.section>

        {/* API 1: Chatbot API */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">1. Chatbot API</h2>
          <p className={`${getTextClasses(theme, 'secondary')} mb-6`}>
            Interactive chat interface with intelligent AI routing (Claude for code, ChatGPT for analysis).
          </p>

          <div className="space-y-6">
            {/* Endpoint */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Endpoint</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm`}>
                <code className="text-green-400">POST</code>{' '}
                <code className="text-blue-400">https://chat.unrepo.dev/api/v1/chatbot</code>
              </pre>
            </div>

            {/* Request */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Request Body</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`{
  "message": "Explain the main function",
  "repoUrl": "https://github.com/owner/repo",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}`}
              </pre>
              
              <div className="mt-4 space-y-2">
                <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <span className="text-red-400 font-mono">message</span> - Your question or prompt (required)
                </p>
                <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <span className="text-red-400 font-mono">repoUrl</span> - GitHub repository URL (optional)
                </p>
                <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <span className="text-red-400 font-mono">conversationHistory</span> - Previous messages for context (optional)
                </p>
              </div>
            </div>

            {/* Response */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Response</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`{
  "success": true,
  "data": {
    "response": "The main function initializes...",
    "message": "Explain the main function",
    "repoUrl": "https://github.com/owner/repo",
    "aiProvider": "intelligent-routing"
  }
}`}
              </pre>
            </div>

            {/* Example */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>cURL Example</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`curl -X POST https://chat.unrepo.dev/api/v1/chatbot \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: unrepo_chatbot_YOUR_KEY_HERE" \\
  -d '{
    "message": "What does this repository do?",
    "repoUrl": "https://github.com/vercel/next.js"
  }'`}
              </pre>
            </div>
          </div>
        </motion.section>

        {/* API 2: Research API */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">2. Research API</h2>
          <p className={`${getTextClasses(theme, 'secondary')} mb-6`}>
            Deep analysis of repository structure, code quality, and potential security issues.
          </p>

          <div className="space-y-6">
            {/* Endpoint */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Endpoint</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm`}>
                <code className="text-green-400">POST</code>{' '}
                <code className="text-blue-400">https://research.unrepo.dev/api/v1/research</code>
              </pre>
            </div>

            {/* Request */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Request Body</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`{
  "repoUrl": "https://github.com/owner/repo",
  "options": {
    "includeAnalysis": true
  }
}`}
              </pre>
              
              <div className="mt-4 space-y-2">
                <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <span className="text-red-400 font-mono">repoUrl</span> - GitHub repository URL (required)
                </p>
                <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                  <span className="text-red-400 font-mono">options</span> - Additional options for analysis (optional)
                </p>
              </div>
            </div>

            {/* Response */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>Response</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`{
  "success": true,
  "data": {
    "repository": {
      "owner": "vercel",
      "name": "next.js",
      "url": "https://github.com/vercel/next.js",
      "description": "The React Framework",
      "language": "TypeScript",
      "stars": 120000,
      "forks": 25000
    },
    "languages": {
      "TypeScript": 85.2,
      "JavaScript": 10.5,
      "CSS": 4.3
    },
    "analysis": {
      "summary": "Production-ready React framework...",
      "architecture": "Monorepo structure with...",
      "keyFeatures": ["SSR", "SSG", "API Routes"]
    },
    "codeQuality": 9.2,
    "rugPotential": "low",
    "aiGenerated": false
  }
}`}
              </pre>
            </div>

            {/* Example */}
            <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${getTextClasses(theme)} mb-2`}>cURL Example</h3>
              <pre className={`${getCodeBlockClasses(theme)} p-4 rounded text-sm overflow-x-auto`}>
{`curl -X POST https://research.unrepo.dev/api/v1/research \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: unrepo_research_YOUR_KEY_HERE" \\
  -d '{
    "repoUrl": "https://github.com/vercel/next.js"
  }'`}
              </pre>
            </div>
          </div>
        </motion.section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Rate Limits</h2>
          <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
            <div className="space-y-3">
              <div className={`flex justify-between items-center pb-3 ${theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
                <span className={getTextClasses(theme)}>Free Tier</span>
                <span className="text-red-400 font-semibold">6 requests/day</span>
              </div>
              <div className={`flex justify-between items-center pb-3 ${theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
                <span className={getTextClasses(theme)}>Token Holder</span>
                <span className="text-green-400 font-semibold">Unlimited</span>
              </div>
              <p className={`text-sm mt-4 ${getTextClasses(theme, 'secondary')}`}>
                Verify your token holdings to unlock unlimited API access.
              </p>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Codes</h2>
          <div className={`${getCardClasses(theme)} p-6 rounded-lg`}>
            <div className="space-y-3 text-sm">
              <div className="flex gap-4">
                <code className="text-red-400 font-mono">401</code>
                <span className={getTextClasses(theme, 'secondary')}>Invalid or missing API key</span>
              </div>
              <div className="flex gap-4">
                <code className="text-red-400 font-mono">429</code>
                <span className={getTextClasses(theme, 'secondary')}>Rate limit exceeded</span>
              </div>
              <div className="flex gap-4">
                <code className="text-red-400 font-mono">400</code>
                <span className={getTextClasses(theme, 'secondary')}>Invalid request parameters</span>
              </div>
              <div className="flex gap-4">
                <code className="text-red-400 font-mono">500</code>
                <span className={getTextClasses(theme, 'secondary')}>Internal server error</span>
              </div>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Client Libraries</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`${getCardClasses(theme)} p-6 rounded-lg`}
          >
            <p className={`${getTextClasses(theme, 'secondary')} mb-4`}>Coming soon:</p>
            <div className={`space-y-2 text-sm ${getTextClasses(theme, 'secondary')}`}>
              <div>• JavaScript/TypeScript SDK</div>
              <div>• Python SDK</div>
              <div>• Go SDK</div>
              <div>• Rust SDK</div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </motion.div>
  );
}
