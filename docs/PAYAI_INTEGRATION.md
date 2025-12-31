# Pay-AI Integration Guide for UnRepo

## Overview
Pay-AI is a Solana-based payment infrastructure that enables crypto payments in your applications. For UnRepo, we use it to process 0.01 USDC payments for chat limit increases.

## Getting Pay-AI API Access

### Option 1: Official Pay-AI Platform (Recommended)
1. Visit the Pay-AI developer portal: https://pay.ai (or their official website)
2. Sign up for a developer account
3. Complete KYC verification (if required)
4. Create a new project for "UnRepo"
5. Generate API credentials:
   - API Key
   - API Secret
   - Webhook Secret (for payment confirmations)
6. Configure your payment settings:
   - Accepted tokens: USDC
   - Network: Solana Mainnet
   - Recipient wallet address

### Option 2: Alternative Solana Payment Processors

If Pay-AI is not available, consider these alternatives:

**Solana Pay:**
- Website: https://solanapay.com
- Open-source protocol
- No API key required
- Direct on-chain verification

**Helio Pay:**
- Website: https://hel.io
- Easy integration
- Multiple token support
- Dashboard for analytics

**Sphere Pay:**
- Website: https://spherepay.co
- Solana-native
- Good developer docs

## Integration Steps

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Pay-AI Configuration
PAYAI_API_KEY=your_payai_api_key_here
PAYAI_API_SECRET=your_payai_secret_here
PAYAI_WEBHOOK_SECRET=your_webhook_secret_here

# Payment Configuration
PAYMENT_RECIPIENT_WALLET=your_solana_wallet_address
PAYMENT_AMOUNT=0.01
PAYMENT_CURRENCY=USDC
```

### 2. Using UnRepo's Payment API

UnRepo already includes payment verification endpoints:

**Verify Payment:**
```bash
POST /api/payment/verify
Content-Type: application/json

{
  "walletAddress": "user_solana_wallet_address",
  "transactionHash": "solana_transaction_signature"
}
```

**Check Payment Status:**
```bash
GET /api/payment/verify?wallet=user_solana_wallet_address
```

### 3. Frontend Integration

The `TokenVerificationModal` component handles the payment flow:

```typescript
// app/app/page.tsx
const [showTokenModal, setShowTokenModal] = useState(false);

// Open modal when chat limit reached
if (chatMessages.length >= 50) {
  setShowTokenModal(true);
}

// Modal handles payment collection
<TokenVerificationModal 
  isOpen={showTokenModal}
  onClose={() => setShowTokenModal(false)}
/>
```

### 4. Payment Flow

**Step 1: User Initiates Payment**
- User reaches chat limit (50 messages)
- TokenVerificationModal opens
- Shows payment amount (0.01 USDC)

**Step 2: Process Payment**
```typescript
// Using Solana Wallet Adapter
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const { connection } = useConnection();
const { publicKey, sendTransaction } = useWallet();

// Create USDC transfer transaction
const transaction = new Transaction().add(
  createTransferInstruction(
    sourceAccount, // User's USDC token account
    destinationAccount, // Your USDC token account
    publicKey, // User's wallet
    amount * 1000000 // USDC has 6 decimals
  )
);

// Send transaction
const signature = await sendTransaction(transaction, connection);

// Wait for confirmation
await connection.confirmTransaction(signature);
```

**Step 3: Verify Payment**
```typescript
// Send transaction hash to backend
const response = await fetch('/api/payment/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: publicKey.toBase58(),
    transactionHash: signature,
  }),
});

const { verified } = await response.json();

if (verified) {
  // Reset chat limit
  // Update user state
}
```

## Implementation Checklist

- [ ] Obtain Pay-AI API credentials (or alternative)
- [ ] Add API keys to `.env.local`
- [ ] Set up payment recipient wallet
- [ ] Update `PAYMENT_RECIPIENT_WALLET` in env
- [ ] Test payment flow on Solana Devnet
- [ ] Implement payment UI in TokenVerificationModal
- [ ] Add USDC token account lookup
- [ ] Handle transaction signing
- [ ] Verify transaction on-chain
- [ ] Update chat limit after payment
- [ ] Add payment history UI
- [ ] Implement webhook listeners (if using Pay-AI)
- [ ] Test on Solana Mainnet with small amounts
- [ ] Add error handling for failed transactions
- [ ] Implement transaction retry logic

## Code Examples

### Complete Payment Function

```typescript
// lib/payment.ts
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export async function sendUSDCPayment(
  connection: Connection,
  senderWallet: PublicKey,
  recipientWallet: PublicKey,
  amount: number,
  sendTransaction: any
) {
  // Get token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    senderWallet
  );
  
  const recipientTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    recipientWallet
  );
  
  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    senderTokenAccount,
    recipientTokenAccount,
    senderWallet,
    amount * 1000000 // Convert to micro USDC
  );
  
  // Build transaction
  const transaction = new Transaction().add(transferInstruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderWallet;
  
  // Send and confirm
  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

### Update TokenVerificationModal

```typescript
// components/app/TokenVerificationModal.tsx
import { sendUSDCPayment } from '@/lib/payment';

const handlePayment = async () => {
  try {
    setIsLoading(true);
    
    const signature = await sendUSDCPayment(
      connection,
      publicKey!,
      new PublicKey(process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT!),
      0.01,
      sendTransaction
    );
    
    // Verify on backend
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: publicKey!.toBase58(),
        transactionHash: signature,
      }),
    });
    
    const { verified } = await response.json();
    
    if (verified) {
      toast.success('Payment verified! Chat limit increased.');
      onClose();
    }
  } catch (error) {
    toast.error('Payment failed');
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

### Devnet Testing
1. Switch to Solana Devnet in your RPC endpoint
2. Get devnet USDC from faucet
3. Test full payment flow
4. Verify transaction on Solana Explorer (devnet)

### Mainnet Testing
1. Start with minimum amounts (0.01 USDC)
2. Test with team wallet first
3. Monitor transactions on Solana Explorer
4. Check recipient wallet receives payments
5. Verify database records correctly

## Troubleshooting

**Transaction Fails:**
- Check wallet has USDC balance
- Verify USDC token account exists
- Check network connection
- Ensure sufficient SOL for fees

**Payment Not Verified:**
- Check transaction signature is correct
- Verify transaction confirmed on-chain
- Check recipient wallet address
- Review backend logs

**API Errors:**
- Verify API credentials
- Check rate limits
- Review webhook configuration
- Check network status

## Security Considerations

1. **Never expose API secrets** in frontend code
2. **Verify all transactions** on-chain before granting access
3. **Use webhooks** for real-time payment confirmations
4. **Implement rate limiting** on payment endpoints
5. **Log all payment attempts** for audit trails
6. **Handle failed transactions** gracefully
7. **Test thoroughly** on devnet before mainnet

## Support Resources

- Pay-AI Documentation: [Official Docs]
- Solana Pay Spec: https://docs.solanapay.com
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js
- SPL Token Program: https://spl.solana.com/token
- UnRepo Discord: [Your Discord Link]

## Next Steps

1. Choose your payment provider (Pay-AI or alternative)
2. Sign up and get API credentials
3. Configure environment variables
4. Implement payment UI
5. Test on devnet
6. Deploy to production
7. Monitor first transactions

---

**Note:** This guide assumes Pay-AI is your chosen provider. If using alternatives like Solana Pay or Helio, refer to their specific documentation for API setup.
