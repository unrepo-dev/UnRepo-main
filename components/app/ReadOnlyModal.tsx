'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { signIn } from 'next-auth/react';

interface ReadOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReadOnlyModal({ isOpen, onClose }: ReadOnlyModalProps) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldExclamationIcon className="w-6 h-6 text-yellow-500" />
                    View-Only Mode
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300">
                    You're currently in <span className="font-semibold text-purple-400">view-only mode</span> with Solana wallet authentication.
                  </p>

                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-400">✅ What you can do:</p>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li>• View repository structure</li>
                      <li>• See code analysis results</li>
                      <li>• Explore file trees</li>
                      <li>• Check platform features</li>
                    </ul>
                  </div>

                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-red-400">❌ Restricted features:</p>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li>• Interactive AI chatbot</li>
                      <li>• Deep code analysis</li>
                      <li>• File content viewing</li>
                      <li>• Custom queries</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => signIn('github', { callbackUrl: window.location.pathname })}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      Upgrade to GitHub Login
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      Get full access to chatbot and all features
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
