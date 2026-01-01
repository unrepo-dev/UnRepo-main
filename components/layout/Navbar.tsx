'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { connected, publicKey, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = session || connected;

  const handleDisconnect = async () => {
    if (session) {
      await signOut({ callbackUrl: '/' });
    } else if (connected) {
      await disconnect();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-red-900/30 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/un.png" alt="UnRepo Logo" className="w-16 h-16 object-contain" />
                <span className="text-xl font-bold text-white">UnRepo</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`fixed top-0 w-full backdrop-blur-sm border-b z-50 transition-colors ${
        theme === 'dark' 
          ? 'bg-black/90 border-red-900/30' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/un.png" alt="UnRepo Logo" className="w-16 h-16 object-contain" />
                <span className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>UnRepo</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <a href="/#features" className={`transition cursor-pointer ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Features
                </a>
                <a href="/#how-it-works" className={`transition cursor-pointer ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  How It Works
                </a>
                <Link href="/app" className={`transition ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Our App
                </Link>
                <Link href="/api-docs" className={`transition ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  API Docs
                </Link>
                {isAuthenticated && (
                  <Link href="/developer" className={`transition ${
                    theme === 'dark' ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-red-600'
                  }`}>
                    Developer Portal
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition ${
                  theme === 'dark' 
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-red-500' 
                    : 'bg-gray-100 hover:bg-gray-200 text-red-600'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/app"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Open App
                  </Link>
                  <div className="flex items-center space-x-2">
                    {session?.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    {publicKey && (
                      <div className={`px-3 py-1 rounded-lg text-sm ${
                        theme === 'dark' 
                          ? 'bg-zinc-900 text-gray-400' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDisconnect}
                      className={`p-2 rounded-lg transition ${
                        theme === 'dark'
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-red-500'
                          : 'bg-gray-100 hover:bg-gray-200 text-red-600'
                      }`}
                      title="Disconnect"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
