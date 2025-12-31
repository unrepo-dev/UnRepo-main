'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import { useTheme } from '@/contexts/ThemeContext';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { connected } = useWallet();
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to /app
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/app');
    }
  }, [session, status, router]);

  // Also redirect if wallet is connected
  useEffect(() => {
    if (connected) {
      router.push('/app');
    }
  }, [connected, router]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Footer />
      </main>
    );
  }
  
  return (
    <main className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
