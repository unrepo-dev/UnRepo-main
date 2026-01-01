'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Eye, EyeOff, Key, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardClasses, getCodeBlockClasses, getTextClasses, getAlertClasses, getHoverClasses } from '@/lib/themeUtils';

interface ApiKey {
  id: string;
  key: string;
  name?: string;
  type: 'RESEARCH' | 'CHATBOT';
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  isActive: boolean;
  user?: {
    paymentVerified: boolean;
    isTokenHolder: boolean;
  };
}

interface ApiUsage {
  endpoint: string;
  method: string;
  count: number;
  lastUsed: string;
}

export default function DeveloperPortal() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<ApiUsage[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('keys');
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedApiType, setSelectedApiType] = useState<'RESEARCH' | 'CHATBOT' | null>(null);
  const [apiName, setApiName] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApiKeys();
      fetchUsageStats();
    }
  }, [status]);

  const fetchApiKeys = async () => {
    try {
      // Fetch from API server
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const email = session?.user?.email || 'anonymous@unrepo.dev';
      
      const res = await fetch(`${apiUrl}/api/keys?email=${email}`);
      const data = await res.json();
      
      if (data.success) {
        setApiKeys(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const email = session?.user?.email || 'anonymous@unrepo.dev';
      
      const res = await fetch(`${apiUrl}/api/keys/usage?email=${email}`);
      const data = await res.json();
      if (data.success) {
        setUsage(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const openApiModal = (type: 'RESEARCH' | 'CHATBOT') => {
    setSelectedApiType(type);
    setShowApiModal(true);
    setApiName('');
  };

  const closeApiModal = () => {
    setShowApiModal(false);
    setSelectedApiType(null);
    setApiName('');
  };

  const generateApiKey = async () => {
    if (!selectedApiType) return;
    
    if (!apiName.trim()) {
      alert('Please enter an API name');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Call the separate API server
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: selectedApiType, 
          name: apiName,
          email: session?.user?.email || 'anonymous@unrepo.dev'
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Store API key in localStorage
        const storageKey = selectedApiType === 'CHATBOT' ? 'unrepo_chatbot_key' : 'unrepo_research_key';
        localStorage.setItem(storageKey, data.data.apiKey);
        
        await fetchApiKeys();
        closeApiModal();
        alert(`✅ API key generated successfully!\n\n🔑 Key: ${data.data.apiKey}\n\n⚠️ This key has been saved to your browser and will be used automatically.\n\n💾 Save this key somewhere safe - it won't be shown again!`);
      } else {
        alert(data.error || 'Failed to generate API key');
        setGenerating(false);
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
      alert('Failed to generate API key. Please try again.');
      setGenerating(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 20) return key;
    return key.substring(0, 20) + '•'.repeat(key.length - 20);
  };

  if (status === 'loading') {
    return (
      <>
      <Navbar />
      <div className={`min-h-screen p-8 pt-24 animate-fadeIn ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
      </div>
      <Footer />
      </>
    );
  }

  if (!session) {
    return (
      <>
      <Navbar />
      <div className={`min-h-screen p-8 pt-24 animate-fadeIn ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-slideDown">
            <h1 className="text-4xl font-bold mb-2 text-red-500">Developer Portal</h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Manage your API keys and monitor usage for UnRepo APIs
            </p>
          </div>
          
          <div className={`border rounded-lg p-8 animate-slideUp ${
            theme === 'dark' ? 'bg-red-900/20 border-red-900' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-red-500">Authentication Required</h2>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  You need to sign in to generate and manage API keys. Sign in with your GitHub account to get started.
                </p>
                <a 
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Sign in with GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  const researchKey = apiKeys.find(k => k.type === 'RESEARCH');
  const chatbotKey = apiKeys.find(k => k.type === 'CHATBOT');

  return (
    <>
    <Navbar />
    <div className={`min-h-screen p-8 pt-24 animate-fadeIn ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-slideDown">
          <h1 className="text-4xl font-bold mb-2 text-red-500">Developer Portal</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Manage your API keys and monitor usage for UnRepo APIs
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 animate-slideDown" style={{ animationDelay: '0.1s' }}>
          <div className={`flex gap-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-4 py-2 -mb-px transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'keys'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : `${getTextClasses(theme, 'secondary')} ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-2 -mb-px transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'usage'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : `${getTextClasses(theme, 'secondary')} ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`
              }`}
            >
              Usage Statistics
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 -mb-px transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'docs'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : `${getTextClasses(theme, 'secondary')} ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`
              }`}
            >
              Documentation
            </button>
          </div>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="animate-slideLeft">
          <div className="space-y-6">
            {/* Research API Key */}
            <div className={`${getCardClasses(theme)} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${getTextClasses(theme)}`}>
                    <Key className="h-5 w-5" />
                    Research API Key
                  </h2>
                  <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                    Analyze GitHub repositories programmatically
                  </p>
                </div>
                {!researchKey && (
                  <button
                    onClick={() => openApiModal('RESEARCH')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Generate Key
                  </button>
                )}
              </div>
              {researchKey && (
                <div className="space-y-4">
                  {researchKey.name && (
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className="text-sm font-semibold">{researchKey.name}</p>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 p-4 ${getCodeBlockClasses(theme)} rounded-lg font-mono text-sm`}>
                    <code className={`flex-1 ${getTextClasses(theme, 'secondary')}`}>
                      {showKeys[researchKey.id] ? researchKey.key : maskApiKey(researchKey.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(researchKey.id)}
                      className={`p-2 ${getHoverClasses(theme)} rounded`}
                    >
                      {showKeys[researchKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(researchKey.key, researchKey.id)}
                      className={`p-2 ${getHoverClasses(theme)} rounded transition-all duration-200 hover:scale-110 active:scale-90`}
                    >
                      {copiedKey === researchKey.id ? '✓' : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Tier</p>
                      <p className="font-semibold">
                        {researchKey.user?.paymentVerified || researchKey.user?.isTokenHolder ? (
                          <span className="text-green-500">Premium</span>
                        ) : (
                          <span className="text-yellow-500">Free</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Calls Used</p>
                      <p className="font-semibold">
                        {researchKey.usageCount}
                        {!(researchKey.user?.paymentVerified || researchKey.user?.isTokenHolder) && ' / 5'}
                      </p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Created</p>
                      <p className="font-semibold">{new Date(researchKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Last Used</p>
                      <p className="font-semibold">
                        {researchKey.lastUsedAt ? new Date(researchKey.lastUsedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  {!(researchKey.user?.paymentVerified || researchKey.user?.isTokenHolder) && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className="text-sm font-semibold mb-1">Free Tier Limit</p>
                      <p className="text-xs">
                        {5 - researchKey.usageCount} calls remaining. Upgrade to premium for unlimited calls.
                      </p>
                    </div>
                  )}
                  {(researchKey.user?.paymentVerified || researchKey.user?.isTokenHolder) && (
                    <div className={`${getAlertClasses(theme)} rounded-lg p-4 text-sm`}>
                      <strong>Rate Limit:</strong> 100 requests/hour (Premium)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chatbot API Key */}
            <div className={`${getCardClasses(theme)} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${getTextClasses(theme)}`}>
                    <Key className="h-5 w-5" />
                    Chatbot API Key
                  </h2>
                  <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                    Chat with AI about repositories via API
                  </p>
                </div>
                {!chatbotKey && (
                  <button
                    onClick={() => openApiModal('CHATBOT')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Generate Key
                  </button>
                )}
              </div>
              {chatbotKey && (
                <div className="space-y-4">
                  {chatbotKey.name && (
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className="text-sm font-semibold">{chatbotKey.name}</p>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 p-4 ${getCodeBlockClasses(theme)} rounded-lg font-mono text-sm`}>
                    <code className={`flex-1 ${getTextClasses(theme, 'secondary')}`}>
                      {showKeys[chatbotKey.id] ? chatbotKey.key : maskApiKey(chatbotKey.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(chatbotKey.id)}
                      className={`p-2 ${getHoverClasses(theme)} rounded`}
                    >
                      {showKeys[chatbotKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(chatbotKey.key, chatbotKey.id)}
                      className={`p-2 ${getHoverClasses(theme)} rounded transition-all duration-200 hover:scale-110 active:scale-90`}
                    >
                      {copiedKey === chatbotKey.id ? '✓' : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Tier</p>
                      <p className="font-semibold">
                        {chatbotKey.user?.paymentVerified || chatbotKey.user?.isTokenHolder ? (
                          <span className="text-green-500">Premium</span>
                        ) : (
                          <span className="text-yellow-500">Free</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Calls Used</p>
                      <p className="font-semibold">
                        {chatbotKey.usageCount}
                        {!(chatbotKey.user?.paymentVerified || chatbotKey.user?.isTokenHolder) && ' / 5'}
                      </p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Created</p>
                      <p className="font-semibold">{new Date(chatbotKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className={getTextClasses(theme, 'secondary')}>Last Used</p>
                      <p className="font-semibold">
                        {chatbotKey.lastUsedAt ? new Date(chatbotKey.lastUsedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  {!(chatbotKey.user?.paymentVerified || chatbotKey.user?.isTokenHolder) && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className="text-sm font-semibold mb-1">Free Tier Limit</p>
                      <p className="text-xs">
                        {5 - chatbotKey.usageCount} calls remaining. Upgrade to premium for unlimited calls.
                      </p>
                    </div>
                  )}
                  {(chatbotKey.user?.paymentVerified || chatbotKey.user?.isTokenHolder) && (
                    <div className={`${getAlertClasses(theme)} rounded-lg p-4 text-sm`}>
                      <strong>Rate Limit:</strong> 200 requests/hour (Premium)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="animate-slideLeft">
          <div className={`${getCardClasses(theme)} rounded-lg p-6`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${getTextClasses(theme)}`}>
              <TrendingUp className="h-5 w-5" />
              API Usage Statistics
            </h2>
            {usage.length === 0 ? (
              <p className={`text-center py-8 ${getTextClasses(theme, 'secondary')}`}>
                No API usage yet. Start making requests to see statistics here.
              </p>
            ) : (
              <div className="space-y-4">
                {usage.map((stat, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 border rounded-lg ${
                    theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div>
                      <p className="font-semibold">{stat.endpoint}</p>
                      <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>{stat.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stat.count} requests</p>
                      <p className={`text-sm flex items-center gap-1 ${getTextClasses(theme, 'secondary')}`}>
                        <Clock className="h-3 w-3" />
                        {new Date(stat.lastUsed).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Docs Tab */}
        {activeTab === 'docs' && (
          <div className="animate-slideLeft">
          <div className={`${getCardClasses(theme)} rounded-lg p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${getTextClasses(theme)}`}>Quick Start Guide</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Research API Example</h3>
                <pre className={`${getCodeBlockClasses(theme)} p-4 rounded-lg overflow-x-auto text-sm`}>
{`curl -X POST https://research.unrepo.dev/api/v1/research \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: unrepo_research_YOUR_KEY_HERE" \\
  -d '{
    "repoUrl": "https://github.com/vercel/next.js"
  }'`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Chatbot API Example</h3>
                <pre className={`${getCodeBlockClasses(theme)} p-4 rounded-lg overflow-x-auto text-sm`}>
{`curl -X POST https://chat.unrepo.dev/api/v1/chatbot \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: unrepo_chatbot_YOUR_KEY_HERE" \\
  -d '{
    "message": "Explain the main functionality",
    "repoUrl": "https://github.com/vercel/next.js"
  }'`}
                </pre>
              </div>

              <div className={`${getAlertClasses(theme)} rounded-lg p-4`}>
                <p className={getTextClasses(theme, 'secondary')}>
                  For complete documentation, visit <a href="/api-docs" className="text-red-400 underline">/api-docs</a>
                </p>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* API Key Generation Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget && !generating) closeApiModal();
        }}>
          <div className={`${getCardClasses(theme)} rounded-lg p-6 max-w-md w-full animate-slideDown`} onClick={(e) => e.stopPropagation()}>
            <h2 className={`text-2xl font-bold mb-4 ${getTextClasses(theme)}`}>
              Generate {selectedApiType === 'RESEARCH' ? 'Research' : 'Chatbot'} API Key
            </h2>
            
            <div className={`mb-4 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${getTextClasses(theme, 'secondary')}`}>
                <strong>Free Tier:</strong> 5 API calls per key
              </p>
              <p className={`text-xs mt-1 ${getTextClasses(theme, 'secondary')}`}>
                {selectedApiType === 'RESEARCH' 
                  ? 'Analyze repositories and get detailed insights' 
                  : 'Chat with repositories and ask questions'}
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${getTextClasses(theme)}`}>
                API Key Name
              </label>
              <input
                type="text"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                placeholder="e.g., My Project API"
                disabled={generating}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && !generating && generateApiKey()}
              />
            </div>

            {generating && (
              <div className="mb-4 flex items-center gap-2 text-yellow-500">
                <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                <span className="text-sm">Generating your API key...</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={generateApiKey}
                disabled={generating || !apiName.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  'Generate Key'
                )}
              </button>
              <button
                onClick={closeApiModal}
                disabled={generating}
                className={`px-4 py-2 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-xs ${getTextClasses(theme, 'secondary')}`}>
                ⚠️ Your API key will be shown only once. Make sure to copy and store it securely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
