'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AppSearchBar from '@/components/app/AppSearchBar';
import FileTree from '@/components/app/FileTree';
import CodePanel from '@/components/app/CodePanel';
import ChatBot from '@/components/app/ChatBot';

export default function AppPage() {
  const { data: session } = useSession();
  const { publicKey, disconnect } = useWallet();
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ file: string; content: string } | null>(null);

  const isGitHubAuth = !!session;
  const isSolanaAuth = !!publicKey && !session;

  const handleLogout = () => {
    if (session) {
      signOut({ callbackUrl: '/' });
    } else if (disconnect) {
      disconnect();
    }
  };

  const handleAskAboutFile = (file: any, content: string) => {
    setChatContext({
      file: file.path,
      content: content,
    });
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* App Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-red-900/30 bg-black backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
              <span className="text-xl font-bold text-red-500">UnRepo</span>
            </Link>

            <div className="flex items-center space-x-4">
              {isGitHubAuth && session?.user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">GitHub: {session.user.name || session.user.email}</span>
                  {session.user.image && (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-red-900/30" />
                  )}
                </div>
              )}
              
              {isSolanaAuth && publicKey && (
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-red-950/20 border border-red-900/30 rounded-lg text-sm text-red-500">
                    View Only Mode
                  </div>
                  <div className="px-3 py-1 bg-zinc-900 border border-red-900/20 rounded-lg text-sm text-gray-400">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-zinc-900 hover:bg-red-950 border border-red-900/30 hover:border-red-800 text-red-500 rounded-lg text-sm transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-full px-6 py-6">
        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <AppSearchBar 
            onSearch={(url) => setRepoUrl(url)}
            onRepoData={(data) => setRepoData(data)}
          />
        </motion.div>

        {/* Main Layout - Full Width Split */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex gap-0 h-[calc(100vh-200px)] border border-red-900/30 rounded-lg overflow-hidden"
        >
          {/* Left Sidebar - File Tree (25%) */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-1/4 bg-black border-r border-red-900/30 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-red-900/30">
              <h2 className="text-red-500 font-semibold text-sm tracking-wide">FILE TREE</h2>
            </div>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-black">
              <FileTree repoData={repoData} onFileSelect={setSelectedFile} />
            </div>
          </motion.div>

          {/* Right Side - Code Panel (75%) */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-black flex flex-col"
          >
            <div className="px-6 py-3 border-b border-red-900/30 flex items-center justify-between">
              <h2 className="text-red-500 font-semibold text-sm tracking-wide">CODE VIEWER</h2>
              {selectedFile && (
                <span className="text-xs text-gray-600">{selectedFile.path}</span>
              )}
            </div>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-black">
              <CodePanel 
                repoData={repoData} 
                selectedFile={selectedFile}
                onAskAboutFile={handleAskAboutFile}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Chatbot Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-[500px] bg-black border-l border-red-900/30 z-50 flex flex-col"
            >
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-red-900/30 flex items-center justify-between">
                <div>
                  <h2 className="text-red-500 font-bold text-lg">AI ASSISTANT</h2>
                  {chatContext && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      Context: {chatContext.file}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-gray-500 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatBot 
                  repoData={repoData}
                  initialContext={chatContext}
                  isGitHubAuth={isGitHubAuth}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
