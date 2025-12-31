'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function HowItWorksSection() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  const steps = [
    {
      number: '01',
      title: 'Connect Your Account',
      description: 'Choose between Solana wallet (view-only) or GitHub OAuth (full access) based on your needs.',
      color: 'red',
    },
    {
      number: '02',
      title: 'Paste Repository URL',
      description: 'Simply paste any GitHub repository URL into our search bar and hit verify.',
      color: 'red',
    },
    {
      number: '03',
      title: 'Get AI Analysis',
      description: 'Receive comprehensive analysis including code quality, rug risk, and AI detection scores.',
      color: 'red',
    },
    {
      number: '04',
      title: 'Chat & Explore',
      description: 'GitHub users can chat with our AI bot, ask questions, and dive deep into the codebase.',
      color: 'red',
    },
  ];

  return (
    <section id="how-it-works" className={`py-24 transition-colors ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            How It <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Four simple steps to unlock powerful repository insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-${step.color}-600 to-${step.color}-700 text-white text-2xl font-bold mb-6`}>
                  {step.number}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{step.title}</h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                }`}>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r to-transparent -translate-x-1/2 ${
                  theme === 'dark' ? 'from-red-900/50' : 'from-red-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-16 p-8 border rounded-2xl ${
          theme === 'dark' 
            ? 'bg-red-950/20 border-red-900/30' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Unlock Full Access</h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>Hold UnRepo tokens to get API access and unlimited chatbot interactions</p>
            </div>
            <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
