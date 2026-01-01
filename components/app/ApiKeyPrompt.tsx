'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ApiKeyPromptProps {
  type: 'CHATBOT' | 'RESEARCH';
  onKeySubmit: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyPrompt({ type, onKeySubmit, onClose }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem(type === 'CHATBOT' ? 'unrepo_chatbot_key' : 'unrepo_research_key', apiKey.trim());
      onKeySubmit(apiKey.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-red-900/30 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-500">
            {type === 'CHATBOT' ? 'Chatbot' : 'Research'} API Key Required
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="text-gray-400 mb-4 text-sm">
          To use this feature, you need a valid API key. You can generate one from the Developer Portal.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Enter your API key:
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`unrepo_${type.toLowerCase()}_...`}
              className="w-full px-4 py-2 bg-black border border-red-900/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!apiKey.trim()}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              Submit
            </button>
            <Link
              href="/developer"
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition text-center"
            >
              Get API Key
            </Link>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-500">
            💡 Your API key will be stored in your browser and used automatically for future requests.
          </p>
        </div>
      </div>
    </div>
  );
}
