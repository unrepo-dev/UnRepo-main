'use client';

import { Dialog } from '@headlessui/react';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useX402Payment } from '@payai/x402-solana-react';
import { formatUSDC, getExplorerUrl } from '@/lib/payment';
import toast from 'react-hot-toast';

interface TokenVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (walletAddress: string) => void;
  currentMessageCount: number;
  messageLimit: number;
}

export default function TokenVerificationModal({
  isOpen,
  onClose,
  onVerify,
  currentMessageCount,
  messageLimit,
}: TokenVerificationModalProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  
  const paymentConfig = {
    amount: parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'),
    currency: 'USDC' as const,
    network: 'mainnet' as const,
  };
  
  const { initiatePayment, paymentStatus, error: paymentError } = useX402Payment(paymentConfig);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'payment' | 'verifying' | 'success'>('info');
  const [transactionSignature, setTransactionSignature] = useState<string>('');

  const handlePayment = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setStep('payment');

    try {
      // Initiate payment via Pay-AI
      const result = await initiatePayment({
        description: 'UnRepo Chat Limit Increase',
        metadata: {
          walletAddress: publicKey.toBase58(),
          feature: 'unlimited_chat',
        },
      });

      if (!result || !result.signature) {
        throw new Error('Failed to create payment');
      }

      setTransactionSignature(result.signature);
      setStep('verifying');

      // Wait for transaction confirmation and verify on backend
      setTimeout(async () => {
        try {
          const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: publicKey.toBase58(),
              transactionHash: result.signature,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Payment verification failed');
          }

          if (data.data.verified) {
            setStep('success');
            toast.success('Payment verified! Chat limit increased.');
            
            if (onVerify) {
              await onVerify(publicKey.toBase58());
            }

            setTimeout(() => {
              onClose();
              resetModal();
            }, 2000);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (err: any) {
          console.error('Payment verification error:', err);
          setError(err.message || 'Failed to verify payment');
          setStep('info');
        } finally {
          setLoading(false);
        }
      }, 3000);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || paymentError || 'Payment failed');
      setStep('info');
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('info');
    setError('');
    setTransactionSignature('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-black border border-red-900/30 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="border-b border-red-900/30 p-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-950/20 border border-red-900/30 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-white">
                  Increase Chat Limit
                </Dialog.Title>
                <p className="text-sm text-gray-500 mt-1">
                  {step === 'info' && 'Unlock unlimited chats with Pay-AI'}
                  {step === 'payment' && 'Processing payment...'}
                  {step === 'verifying' && 'Verifying your payment...'}
                  {step === 'success' && 'Payment verified successfully!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              className="p-1 hover:bg-zinc-900 rounded-lg transition"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Progress Info */}
            <div className="bg-zinc-900 border border-red-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Messages Used</span>
                <span className="text-sm font-semibold text-white">
                  {currentMessageCount} / {messageLimit}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(currentMessageCount / messageLimit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step: Info */}
            {step === 'info' && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Benefits after payment:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✓</span>
                      <span>Unlimited chat messages with AI assistant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✓</span>
                      <span>Priority analysis processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✓</span>
                      <span>Access to API keys for integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✓</span>
                      <span>Advanced repository insights</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
                  <p className="text-xs text-gray-400">
                    <strong className="text-red-400">Payment Required:</strong> {formatUSDC(parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'))} to prevent spam.
                    Secure payment powered by Pay-AI.
                  </p>
                </div>
              </>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <>
                <div className="bg-zinc-900 border border-red-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Amount</span>
                    <span className="text-sm font-semibold text-red-400">
                      {formatUSDC(parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'))}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
                  <p className="text-xs text-yellow-300">
                    <strong>⚠️ Processing:</strong> Please approve the payment in your wallet.
                    Do not close this window.
                  </p>
                </div>
              </>
            )}

            {/* Step: Verifying */}
            {step === 'verifying' && (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
                  <p className="text-sm text-gray-400 text-center">
                    Verifying your payment on the blockchain...
                  </p>
                  {transactionSignature && (
                    <a
                      href={getExplorerUrl(transactionSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      View on Solana Explorer
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">
                    Payment Verified!
                  </p>
                  <p className="text-sm text-gray-400 text-center">
                    You now have unlimited chat messages.
                  </p>
                  {transactionSignature && (
                    <a
                      href={getExplorerUrl(transactionSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  resetModal();
                }}
                className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition disabled:opacity-50"
                disabled={loading || step === 'verifying'}
              >
                Cancel
              </button>
              
              {step === 'info' && (
                <button
                  onClick={handlePayment}
                  disabled={loading || !publicKey}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!publicKey ? 'Connect Wallet' : 'Pay with Pay-AI'}
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
