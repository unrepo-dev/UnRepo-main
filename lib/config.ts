// Application configuration and constants

export const APP_CONFIG = {
  name: 'UnRepo',
  description: 'AI-powered GitHub repository analysis platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Chat limits
  chat: {
    freeUserLimit: 6, // 5-6 messages before requiring verification
    tokenHolderLimit: Infinity,
  },
  
  // Payment
  payment: {
    verificationAmount: 0.01, // USDC
    currency: 'USDC',
  },
  
  // Cache TTL (in seconds)
  cache: {
    repositoryData: 3600, // 1 hour
    fileTree: 3600, // 1 hour
    analysis: 86400, // 24 hours
    chatHistory: 86400, // 24 hours
  },
  
  // Rate limits
  rateLimit: {
    api: {
      research: 100, // requests per hour
      chatbot: 100, // requests per hour
    },
    chat: {
      messagesPerMinute: 10,
      messagesPerHour: 60,
    },
  },
  
  // GitHub
  github: {
    maxFilesToAnalyze: 50,
    maxFileSize: 1024 * 1024, // 1MB
    supportedLanguages: [
      'javascript',
      'typescript',
      'python',
      'java',
      'rust',
      'go',
      'solidity',
      'c',
      'cpp',
      'ruby',
      'php',
    ],
  },
  
  // Solana
  solana: {
    network: 'mainnet-beta',
    tokenMint: process.env.NEXT_PUBLIC_UNREPO_TOKEN_MINT || '',
    minimumHolding: 1, // Minimum tokens to hold for access
  },
  
  // Special repositories
  specialRepos: {
    unrepo: ['unrepo', 'unre'], // Repository names that trigger special response
  },
};

export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    session: '/api/auth/session',
  },
  github: {
    analyze: '/api/github/analyze',
    files: '/api/github/files',
    content: '/api/github/content',
  },
  chat: {
    send: '/api/chat/send',
    history: '/api/chat/history',
    limit: '/api/chat/limit',
  },
  wallet: {
    verify: '/api/wallet/verify',
    balance: '/api/wallet/balance',
    payment: '/api/wallet/payment',
  },
  api: {
    research: '/api/v1/research',
    chatbot: '/api/v1/chatbot',
    keys: '/api/v1/keys',
  },
};

export const MESSAGES = {
  errors: {
    unauthorized: 'You must be logged in to access this feature',
    invalidRepo: 'Invalid GitHub repository URL',
    repoNotFound: 'Repository not found or not accessible',
    chatLimitReached: 'Chat limit reached. Please verify your wallet to continue.',
    noTokens: "You don't have UnRepo tokens. Please purchase some to increase chat limit.",
    paymentRequired: 'Payment verification required',
    networkError: 'Network error. Please try again.',
  },
  success: {
    repoAnalyzed: 'Repository analyzed successfully',
    paymentVerified: 'Payment verified successfully',
    tokenHolder: 'Token holder verified. Unlimited access granted!',
    apiKeyGenerated: 'API key generated successfully',
  },
  info: {
    basicView: 'This is the basic view. Connect with GitHub for interactive features.',
    readOnly: "You're viewing in read-only mode. Chat is not available with wallet authentication.",
    analyzing: 'Analyzing repository... This may take a moment.',
  },
};

export default APP_CONFIG;
