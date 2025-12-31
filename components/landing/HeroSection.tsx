'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTheme } from '@/contexts/ThemeContext';
import LoginModal from '@/components/layout/LoginModal';

export default function HeroSection() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { connected } = useWallet();
  const { theme } = useTheme();

  const isAuthenticated = session || connected;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-red-950/20 via-black to-red-900/10' 
            : 'bg-gradient-to-br from-red-50 via-white to-red-50'
        }`}></div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="mb-8">
            <span className={`px-4 py-2 border rounded-full text-sm font-semibold ${
              theme === 'dark' 
                ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              AI-Powered Repository Analysis
            </span>
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Analyze GitHub Repos
            <br />
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              With AI Intelligence
            </span>
          </h1>

          <p className={`text-xl mb-12 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Detect rug pulls, assess code quality, identify AI-generated code, and chat with an intelligent bot about any repository. Built for developers, investors, and auditors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-red-900/50"
              >
                Open App
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-red-900/50"
              >
                Get Started Free
              </button>
            )}
            <Link
              href="#features"
              className={`px-8 py-4 border rounded-xl font-semibold text-lg transition ${
                theme === 'dark' 
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-red-900/30 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900'
              }`}
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
