'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ApiKeyPrompt from './ApiKeyPrompt';

interface AppSearchBarProps {
  onSearch: (url: string) => void;
  onRepoData: (data: any) => void;
}

export default function AppSearchBar({ onSearch, onRepoData }: AppSearchBarProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

  const handleVerify = async () => {
    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Check for API key
    const apiKey = localStorage.getItem('unrepo_research_key');
    if (!apiKey) {
      setShowApiKeyPrompt(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/v1/research`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('unrepo_research_key') || ''
        },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      onSearch(url);
      onRepoData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black border border-red-900/30 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-500 mb-3">
          GitHub Repository URL
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="https://github.com/owner/repository"
              className="w-full px-4 py-3 bg-zinc-900 border border-red-900/30 rounded-lg text-gray-300 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              disabled={loading}
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVerify}
            disabled={loading}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white rounded-lg font-semibold transition"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </motion.button>
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
      {showApiKeyPrompt && (
        <ApiKeyPrompt
          type="RESEARCH"
          onKeySubmit={() => handleVerify()}
          onClose={() => setShowApiKeyPrompt(false)}
        />
      )}
    </div>
  );
}
