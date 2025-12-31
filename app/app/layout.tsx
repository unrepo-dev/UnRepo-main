'use client';

import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session && !connected) {
      router.push('/');
    }
  }, [session, status, connected, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session && !connected) {
    return null;
  }

  return <div className="min-h-screen bg-black">{children}</div>;
}
