import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';
import { Connection, PublicKey } from '@solana/web3.js';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana mainnet
const PAYMENT_AMOUNT = 0.01; // 0.01 USDC
const RECIPIENT_WALLET = process.env.PAYMENT_RECIPIENT_WALLET || '';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, transactionHash, paymentId } = await request.json();

    if (!walletAddress || !transactionHash) {
      return errorResponse('Wallet address and transaction hash are required');
    }

    // Check if transaction already verified
    const existing = await prisma.payment.findUnique({
      where: { transactionHash },
    });

    if (existing) {
      if (existing.status === 'VERIFIED') {
        return successResponse({ 
          verified: true,
          message: 'Payment already verified',
          payment: {
            id: existing.id,
            amount: existing.amount,
            currency: existing.currency,
            verifiedAt: existing.verifiedAt,
          },
        });
      }
      return errorResponse('Payment pending or failed', 400);
    }

    // Verify transaction on Solana blockchain
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    let transaction;
    try {
      transaction = await connection.getTransaction(transactionHash, {
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.warn('Transaction not found on-chain yet, might still be confirming');
      // For Pay-AI, transaction might still be confirming
      // Create pending record
      let user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            authMethod: 'SOLANA',
          },
        });
      }

      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          walletAddress,
          amount: parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'),
          currency: process.env.NEXT_PUBLIC_PAYAI_CURRENCY || 'USDC',
          transactionHash,
          status: 'PENDING',
        },
      });

      return successResponse({
        verified: false,
        pending: true,
        message: 'Transaction pending confirmation',
        payment: {
          id: payment.id,
        },
      });
    }

    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Verify transaction details
    const isValid = transaction.meta?.err === null;

    if (!isValid) {
      return errorResponse('Transaction failed on blockchain', 400);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          authMethod: 'SOLANA',
        },
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        walletAddress,
        amount: parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'),
        currency: process.env.NEXT_PUBLIC_PAYAI_CURRENCY || 'USDC',
        transactionHash,
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    // Update user payment status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        paymentVerified: true,
      },
    });

    return successResponse({
      verified: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        verifiedAt: payment.verifiedAt,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return errorResponse(error.message || 'Payment verification failed', 500);
  }
}

// GET - Check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return errorResponse('Wallet address is required');
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        paymentVerified: true,
      },
    });

    return successResponse({
      paymentVerified: user?.paymentVerified || false,
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    return errorResponse(error.message || 'Payment status check failed', 500);
  }
}
