'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <footer className="bg-black border-t border-red-900/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/un.png" alt="UnRepo Logo" className="w-16 h-16 object-contain" />
                <span className="text-xl font-bold text-white">UnRepo</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  return (
    <footer className={`border-t transition-colors ${
      theme === 'dark' 
        ? 'bg-black border-red-900/30' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/un.png" alt="UnRepo Logo" className="w-16 h-16 object-contain" />
              <span className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>UnRepo</span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              AI-powered GitHub repository analysis platform for developers and investors.
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Product</h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Features</Link></li>
              <li><Link href="/app" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Our App</Link></li>
              <li><Link href="/#pricing" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/docs" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>API Docs</Link></li>
              <li><Link href="/guides" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Guides</Link></li>
              <li><Link href="/support" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Twitter</a></li>
              <li><a href="https://github.com" target="_blank" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>GitHub</a></li>
              <li><a href="https://discord.com" target="_blank" className={`transition text-sm ${
                theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Discord</a></li>
            </ul>
          </div>
        </div>

        <div className={`mt-12 pt-8 border-t text-center text-sm ${
          theme === 'dark' 
            ? 'border-red-900/30 text-gray-600' 
            : 'border-gray-200 text-gray-600'
        }`}>
          <p>&copy; {new Date().getFullYear()} UnRepo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
