'use client';

import { SessionProvider } from 'next-auth/react';
import SolanaWalletProvider from './SolanaWalletProvider';
import PayAIProvider from './PayAIProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SolanaWalletProvider>
          <PayAIProvider>{children}</PayAIProvider>
        </SolanaWalletProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
