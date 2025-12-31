import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';

// Payment callback from Pay-AI facilitator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, signature, status, walletAddress, metadata } = body;

    console.log('Pay-AI callback received:', body);

    if (!paymentId || !signature) {
      return errorResponse('Invalid callback data');
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

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { transactionHash: signature },
      create: {
        userId: user.id,
        walletAddress,
        amount: parseFloat(process.env.NEXT_PUBLIC_PAYAI_AMOUNT || '0.01'),
        currency: process.env.NEXT_PUBLIC_PAYAI_CURRENCY || 'USDC',
        transactionHash: signature,
        status: status === 'completed' ? 'VERIFIED' : 'PENDING',
        verifiedAt: status === 'completed' ? new Date() : null,
      },
      update: {
        status: status === 'completed' ? 'VERIFIED' : status === 'failed' ? 'FAILED' : 'PENDING',
        verifiedAt: status === 'completed' ? new Date() : null,
      },
    });

    // Update user payment status if verified
    if (status === 'completed') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          paymentVerified: true,
        },
      });
    }

    return successResponse({
      received: true,
      paymentId,
      status: payment.status,
    });
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return errorResponse(error.message || 'Callback processing failed', 500);
  }
}

// GET - Check callback status (for testing)
export async function GET(request: NextRequest) {
  return successResponse({
    endpoint: '/api/payment/callback',
    status: 'ready',
    facilitatorUrl: process.env.NEXT_PUBLIC_PAYAI_FACILITATOR_URL,
  });
}
