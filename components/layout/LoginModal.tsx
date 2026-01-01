'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { signIn } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import bs58 from 'bs58';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { setVisible } = useWalletModal();
  const { connected, select, wallets, connect, disconnect, publicKey, signMessage } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Close modal when wallet connects and signs
  useEffect(() => {
    if (connected && publicKey) {
      // Wallet is connected, now verify with signature
      handleSignMessage();
    }
  }, [connected, publicKey]);

  const handleSignMessage = async () => {
    if (!signMessage || !publicKey) return;

    try {
      const message = `Sign this message to authenticate with UnRepo.\n\nWallet: ${publicKey.toBase58()}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      
      console.log('Signature:', bs58.encode(signature));
      // Successfully signed - close modal
      onClose();
    } catch (err) {
      console.error('Error signing message:', err);
      setError('Please sign the message to complete authentication');
      // Disconnect if user rejects signature
      await disconnect();
    }
  };

  const handleGithubLogin = async () => {
    try {
      // Sign in with GitHub and stay on current page
      await signIn('github', { 
        callbackUrl: window.location.pathname || '/',
        redirect: true 
      });
      // Modal will close automatically after successful auth
      onClose();
    } catch (error) {
      console.error('GitHub login error:', error);
      setError('Failed to initiate GitHub login');
    }
  };

  const handleSolanaLogin = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // Try to find and select Phantom wallet
      const phantomWallet = wallets.find(
        wallet => wallet.adapter.name === 'Phantom'
      );
      
      if (phantomWallet) {
        select(phantomWallet.adapter.name);
        // Small delay to ensure wallet is selected
        setTimeout(async () => {
          try {
            await connect();
            // Connection and signing will be handled by useEffect
          } catch (err: any) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect wallet');
            setIsConnecting(false);
          }
        }, 100);
      } else {
        // If Phantom not found, open modal to show all wallets
        setVisible(true);
        setIsConnecting(false);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-200 border-4 border-black p-6 text-left align-middle shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-black">
                      Welcome,
                    </Dialog.Title>
                    <p className="text-gray-700 font-semibold text-lg mt-1">
                      sign in to continue
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-black hover:text-red-600 transition"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSolanaLogin}
                    disabled={isConnecting}
                    className="w-full group relative overflow-hidden px-6 py-3 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-semibold text-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <img src="/phn-removebg-preview.png" alt="Phantom" className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 group-hover:text-white transition-colors">
                      {isConnecting ? 'Connecting...' : 'Connect with Phantom'}
                    </span>
                  </motion.button>

                  <div className="flex items-center justify-center gap-3">
                    <div className="w-24 h-1 rounded-full bg-gray-600" />
                    <span className="text-black font-bold text-sm">OR</span>
                    <div className="w-24 h-1 rounded-full bg-gray-600" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGithubLogin}
                    className="w-full group relative overflow-hidden px-6 py-3 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-semibold text-black flex items-center justify-center gap-3"
                  >
                    <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <svg className="w-6 h-6 relative z-10 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <span className="relative z-10 group-hover:text-white transition-colors">Continue with Github</span>
                  </motion.button>
                </div>

                <div className="mt-6 p-4 bg-red-100 rounded-lg border-2 border-red-600">
                  <p className="text-xs text-gray-800 font-medium">
                    <strong className="text-red-600">Note:</strong> GitHub gives full access with chatbot. Solana wallet is view-only access.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
