'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  CodeBracketIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  CpuChipIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Rug Pull Detection',
    description: 'Advanced AI algorithms analyze code patterns, commit history, and project structure to identify potential rug pull risks.',
    gradient: 'from-red-600 to-red-700',
  },
  {
    icon: CodeBracketIcon,
    title: 'Code Quality Analysis',
    description: 'Get comprehensive code quality scores based on best practices, architecture patterns, and maintainability metrics.',
    gradient: 'from-red-500 to-red-600',
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Generated Detection',
    description: 'Identify AI-generated code vs hand-written code with machine learning models trained on millions of repositories.',
    gradient: 'from-red-700 to-red-800',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Interactive Chatbot',
    description: 'Chat with our AI assistant about any repository. Ask questions, get insights, and understand codebases faster.',
    gradient: 'from-red-600 to-red-700',
  },
  {
    icon: ChartBarIcon,
    title: 'Sustainability Scoring',
    description: 'Evaluate long-term viability, maintenance patterns, and community engagement to predict project sustainability.',
    gradient: 'from-red-500 to-red-700',
  },
  {
    icon: KeyIcon,
    title: 'API Access',
    description: 'Integrate UnRepo analysis into your applications with our comprehensive REST API for token holders.',
    gradient: 'from-red-700 to-red-900',
  },
];

export default function FeaturesSection() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <section id="features" className={`py-24 transition-colors ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Powerful Features for
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"> Everyone</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Whether you're an investor checking for scams, a developer reviewing code, or an auditor assessing projects, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative border rounded-2xl p-8 hover:scale-105 transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-zinc-900/50 border-red-900/30 hover:border-red-900/50' 
                  : 'bg-white border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{feature.title}</h3>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
