'use client';

import { ReactNode } from 'react';

interface PayAIProviderProps {
  children: ReactNode;
}

// Pay-AI SDK provides hooks and components, not a provider wrapper
// The payment functionality is accessed via useX402Payment hook directly in components
export default function PayAIProvider({ children }: PayAIProviderProps) {
  return <>{children}</>;
}

