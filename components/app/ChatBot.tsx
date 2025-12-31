'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ChatBotProps {
  repoData: any;
  initialContext?: { file: string; content: string } | null;
  isGitHubAuth: boolean;
}

const placeholders = [
  "Ask about this code...",
  "What does this function do?",
  "Explain this implementation...",
  "Find issues in this code...",
  "Suggest improvements...",
];

export default function ChatBot({ repoData, initialContext, isGitHubAuth }: ChatBotProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial context message when chat opens
  useEffect(() => {
    if (initialContext) {
      setMessages([{
        role: 'system',
        content: `Context: Analyzing file "${initialContext.file}"\n\nI'm ready to answer questions about this code. What would you like to know?`,
      }]);
    }
  }, [initialContext]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholder(placeholders[placeholderIndex]);
  }, [placeholderIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check if user has GitHub authentication
    if (!isGitHubAuth) {
      toast.error('View-Only Mode', {
        description: 'Chat feature requires GitHub login. Please login with GitHub to access the AI chatbot.',
        duration: 5000,
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Include file context if available
      const context = initialContext ? {
        file: initialContext.file,
        content: initialContext.content.substring(0, 2000), // Limit context size
      } : null;

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          repoUrl: repoData?.repo?.url || '',
          context,
          sessionId: 'session-' + Date.now(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.response }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-black">
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 mt-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-950/20 border border-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-500">Ask questions about the code</p>
            <p className="text-sm mt-2 text-gray-700">AI will analyze and explain</p>
          </motion.div>
        )}
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-red-950/20 border border-red-900/30 text-gray-400'
                  : 'bg-zinc-900 border border-red-900/20 text-gray-300'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-900 border border-red-900/20 text-gray-300 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-red-900/30 bg-black">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-zinc-900 border border-red-900/30 rounded-lg text-gray-300 placeholder-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
