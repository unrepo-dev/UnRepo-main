// UnRepo API Client for Frontend
// This file helps the frontend communicate with the separate API server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Store JWT token in localStorage
export const TokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unrepo_token', token);
    }
  },
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unrepo_token');
    }
    return null;
  },
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unrepo_token');
    }
  },
};

// API Client Class
class UnRepoApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Helper to make authenticated requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = TokenStorage.get();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any headers from options
    if (options.headers) {
      const optionsHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optionsHeaders);
    }

    if (token && !endpoint.includes('/api/v1/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // ===== Authentication =====

  async loginWithGithub(githubData: {
    githubId: string;
    githubUsername: string;
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>(
      '/auth/github/login',
      {
        method: 'POST',
        body: JSON.stringify(githubData),
      }
    );

    if (response.success && response.data?.token) {
      TokenStorage.set(response.data.token);
    }

    return response;
  }

  async getSession(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/session');
  }

  logout() {
    TokenStorage.remove();
  }

  // ===== API Key Management =====

  async generateApiKey(
    type: 'CHATBOT' | 'RESEARCH',
    name: string
  ): Promise<ApiResponse<{
    apiKey: string;
    type: string;
    name: string;
    createdAt: string;
    isActive: boolean;
    usageCount: number;
  }>> {
    return this.request('/api/keys/generate', {
      method: 'POST',
      body: JSON.stringify({ type, name }),
    });
  }

  async getApiKeys(): Promise<ApiResponse<any[]>> {
    return this.request('/api/keys');
  }

  async getApiUsage(): Promise<ApiResponse<any[]>> {
    return this.request('/api/keys/usage');
  }

  // ===== Chatbot API =====

  async chat(params: {
    apiKey: string;
    message: string;
    repoUrl?: string;
    repoContext?: any;
    conversationHistory?: any[];
  }): Promise<ApiResponse<{
    response: string;
    conversationHistory: any[];
    usage: { count: number; limit: number | null };
  }>> {
    return this.request('/api/v1/chatbot', {
      method: 'POST',
      headers: {
        'x-api-key': params.apiKey,
      },
      body: JSON.stringify({
        message: params.message,
        repoUrl: params.repoUrl,
        repoContext: params.repoContext,
        conversationHistory: params.conversationHistory,
      }),
    });
  }

  // ===== Research API =====

  async research(params: {
    apiKey: string;
    repoUrl: string;
    options?: any;
  }): Promise<ApiResponse<{
    repository: any;
    languages: any;
    fileTree: any[];
    files: any[];
    analysis: string;
  }>> {
    return this.request('/api/v1/research', {
      method: 'POST',
      headers: {
        'x-api-key': params.apiKey,
      },
      body: JSON.stringify({
        repoUrl: params.repoUrl,
        options: params.options,
      }),
    });
  }
}

// Export singleton instance
export const apiClient = new UnRepoApiClient();

// Export types
export type { ApiResponse };
