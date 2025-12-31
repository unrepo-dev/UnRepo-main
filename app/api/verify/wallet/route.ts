import { NextRequest } from 'next/server';
import { checkTokenHolder } from '@/lib/solana';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, paymentSignature } = await request.json();

    if (!walletAddress) {
      return errorResponse('Wallet address is required');
    }

    // Verify wallet holds UnRepo tokens
    const { holdsToken, balance } = await checkTokenHolder(walletAddress);

    if (!holdsToken) {
      return errorResponse('Wallet does not hold UnRepo tokens', 403);
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          walletAddress,
          authMethod: 'SOLANA',
          isTokenHolder: true,
          tokenBalance: balance,
          verifiedAt: new Date(),
          paymentSignature: paymentSignature || null,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { walletAddress },
        data: {
          isTokenHolder: true,
          tokenBalance: balance,
          verifiedAt: new Date(),
          paymentSignature: paymentSignature || null,
        },
      });
    }

    return successResponse({
      verified: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        isTokenHolder: user.isTokenHolder,
        balance,
      },
    }, 'Wallet verified successfully');
  } catch (error: any) {
    console.error('Verification error:', error);
    return errorResponse(error.message || 'Verification failed', 500);
  }
}
