// Type definitions for the UnRepo platform

export type AuthMethod = 'SOLANA' | 'GITHUB';

export interface User {
  id: string;
  email?: string;
  walletAddress?: string;
  githubId?: string;
  githubUsername?: string;
  name?: string;
  avatar?: string;
  authMethod: AuthMethod;
  isTokenHolder: boolean;
  tokenBalance?: number;
  paymentVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryData {
  owner: string;
  name: string;
  fullName: string;
  branch: string;
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  sha?: string;
  language?: string;
}

export interface CodeReference {
  file: string;
  startLine: number;
  endLine: number;
  code: string;
  language: string;
}

export interface AnalysisResult {
  codeQuality: number; // 0-100
  rugPotential: number; // 0-100
  aiGenerated: number; // 0-100
  sustainability: {
    longTerm: string;
    maintainability: string;
    scalability: string;
  };
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  repoContext?: string;
}

export interface ApiKeyData {
  id: string;
  key: string;
  name?: string;
  type: 'RESEARCH' | 'CHATBOT';
  usageCount: number;
  rateLimit: number;
  isActive: boolean;
  createdAt: Date;
}

export interface TokenVerification {
  walletAddress: string;
  tokenBalance: number;
  holdsToken: boolean;
  paymentRequired: boolean;
  paymentVerified: boolean;
}

export interface PaymentData {
  amount: number;
  currency: string;
  transactionHash: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// GitHub API types
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  type: 'file' | 'dir';
  download_url?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content?: string;
  encoding?: string;
}

// Chat related types
export interface ChatSession {
  id: string;
  userId: string;
  repoUrl?: string;
  messageCount: number;
  createdAt: Date;
  lastMessageAt: Date;
}

export interface ChatLimit {
  current: number;
  limit: number;
  isExceeded: boolean;
  requiresVerification: boolean;
}
