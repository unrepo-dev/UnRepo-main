# Stage 2: Payment Integration & API System

## Overview
Stage 2 implements the complete payment processing, wallet verification, and API key management system for UnRepo. This enables token holders to access premium features and third-party developers to integrate UnRepo's analysis capabilities.

## ✅ Completed Features

### 1. Wallet Verification System
- **API Endpoint**: `/api/verify/wallet` (POST)
- **Functionality**: Verifies Solana wallet holds UnRepo tokens
- **Integration**: Uses `lib/solana.ts` `checkTokenHolder()` function
- **Database**: Updates `User.isTokenHolder` flag in Prisma

```bash
# Verify Wallet
POST /api/verify/wallet
Content-Type: application/json

{
  "walletAddress": "your_solana_wallet_address"
}

# Response
{
  "success": true,
  "data": {
    "verified": true,
    "balance": 100.5
  }
}
```

### 2. API Key Generation
- **API Endpoint**: `/api/keys/generate` (POST, GET)
- **Key Prefixes**:
  - Research API: `unr_research_[32-byte-hex]`
  - Chatbot API: `unr_chatbot_[32-byte-hex]`
- **Features**:
  - Generate unique API keys
  - Track usage count
  - Rate limiting (100 req/hour default)
  - Active/inactive status management

```bash
# Generate API Key
POST /api/keys/generate
Content-Type: application/json

{
  "type": "RESEARCH",  # or "CHATBOT"
  "name": "My Project Key"
}

# List API Keys
GET /api/keys/generate
```

### 3. Research API
- **API Endpoint**: `/api/research` (POST)
- **Authentication**: Requires `x-api-key` header
- **Functionality**:
  - Repository analysis
  - Rug pull detection
  - Code quality scoring
  - AI-generated code detection
- **Usage Tracking**: Logs to `ApiUsage` table

```bash
# Analyze Repository
POST /api/research
x-api-key: unr_research_your_key_here
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo"
}

# Response
{
  "success": true,
  "data": {
    "repository": { ... },
    "languages": { ... },
    "analysis": {
      "rugPotential": 25,
      "codeQuality": 85,
      "aiGenerated": 10,
      "summary": "..."
    }
  }
}
```

### 4. Chatbot Integration API
- **API Endpoint**: `/api/chatbot` (POST)
- **Authentication**: Requires `x-api-key` header
- **Response Formats**:
  - `standard`: Basic repo info + analysis
  - `compact`: Minimal response for chatbots
  - `detailed`: Full repository data + file tree
- **Use Cases**: Discord bots, Telegram bots, CLI tools

```bash
# Standard Format
POST /api/chatbot
x-api-key: unr_chatbot_your_key_here
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "format": "standard"  # or "compact", "detailed"
}

# Compact Response (for chat)
{
  "repo": "owner/repo",
  "rugScore": "LOW",
  "summary": "High-quality TypeScript project with good test coverage..."
}
```

### 5. Payment Verification System
- **Payment Method**: 0.01 USDC via Solana
- **API Endpoint**: `/api/payment/verify` (POST, GET)
- **Features**:
  - On-chain transaction verification
  - Payment record in database
  - Automatic user upgrade to premium
- **Library**: `lib/payment.ts` with helper functions

```bash
# Verify Payment
POST /api/payment/verify
Content-Type: application/json

{
  "walletAddress": "user_wallet_address",
  "transactionHash": "solana_transaction_signature"
}

# Check Payment Status
GET /api/payment/verify?wallet=user_wallet_address
```

### 6. Payment Flow UI
- **Component**: `TokenVerificationModal.tsx`
- **Steps**:
  1. Check USDC balance
  2. Send 0.01 USDC payment
  3. Verify transaction on-chain
  4. Backend verification
  5. Unlock unlimited chats
- **Integration**: Uses Solana Wallet Adapter

## 📊 Database Schema

### ApiKey Model
```prisma
model ApiKey {
  id          String     @id @default(cuid())
  userId      String
  key         String     @unique
  name        String?
  type        ApiKeyType
  usageCount  Int        @default(0)
  lastUsedAt  DateTime?
  rateLimit   Int        @default(100)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  expiresAt   DateTime?
  usageLogs   ApiUsage[]
}

enum ApiKeyType {
  RESEARCH
  CHATBOT
}
```

### ApiUsage Model
```prisma
model ApiUsage {
  id             String   @id @default(cuid())
  userId         String
  apiKeyId       String
  endpoint       String
  method         String
  requestData    String?  @db.Text
  responseStatus Int?
  createdAt      DateTime @default(now())
}
```

### Payment Model
```prisma
model Payment {
  id              String        @id @default(cuid())
  userId          String
  walletAddress   String
  amount          Float
  currency        String        @default("USDC")
  transactionHash String        @unique
  status          PaymentStatus @default(PENDING)
  verifiedAt      DateTime?
  createdAt       DateTime      @default(now())
}

enum PaymentStatus {
  PENDING
  VERIFIED
  FAILED
}
```

## 🔧 Helper Libraries

### lib/payment.ts
Solana payment utilities:
- `sendUSDCPayment()` - Send USDC with wallet adapter
- `getUSDCBalance()` - Check wallet USDC balance
- `verifyTransaction()` - Verify transaction on-chain
- `hasSufficientBalance()` - Check if wallet has enough USDC
- `formatUSDC()` - Format amounts for display
- `getExplorerUrl()` - Get Solana Explorer link

### lib/solana.ts
Token verification:
- `checkTokenHolder()` - Check if wallet holds UnRepo tokens
- `getTokenBalance()` - Get token balance for wallet

## 🔐 Environment Variables

Add to `.env.local`:

```env
# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT=your_solana_wallet_address
PAYMENT_AMOUNT=0.01
PAYMENT_CURRENCY=USDC

# Solana Network
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Pay-AI (Optional - if using Pay-AI service)
PAYAI_API_KEY=your_payai_api_key
PAYAI_API_SECRET=your_payai_secret
PAYAI_WEBHOOK_SECRET=your_webhook_secret
```

## 📖 Pay-AI Integration Guide

See detailed guide: `docs/PAYAI_INTEGRATION.md`

### Quick Start:
1. **Get Pay-AI Credentials** (or use Solana Pay as alternative)
2. **Configure Recipient Wallet**
3. **Test on Devnet First**
4. **Deploy to Mainnet**

### Alternative Payment Processors:
- **Solana Pay**: https://solanapay.com (free, open-source)
- **Helio Pay**: https://hel.io
- **Sphere Pay**: https://spherepay.co

## 🧪 Testing

### Test Wallet Verification
```bash
curl -X POST http://localhost:3000/api/verify/wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_WALLET_ADDRESS"}'
```

### Test API Key Generation
```bash
curl -X POST http://localhost:3000/api/keys/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{"type": "RESEARCH", "name": "Test Key"}'
```

### Test Research API
```bash
curl -X POST http://localhost:3000/api/research \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/vercel/next.js"}'
```

### Test Chatbot API
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/vercel/next.js", "format": "compact"}'
```

## 🚀 Deployment Steps

### 1. Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 2. Configure Environment
- Add all required env variables
- Set payment recipient wallet
- Configure Solana RPC (use paid RPC for production)

### 3. Test Payment Flow
1. Connect wallet
2. Reach chat limit (50 messages)
3. Open payment modal
4. Send 0.01 USDC
5. Verify transaction
6. Confirm unlimited chats unlocked

### 4. Monitor API Usage
- Check `ApiUsage` table for logs
- Monitor rate limits
- Track API key usage patterns

## 📈 Usage Analytics

Track API performance:
```sql
-- Total API calls per key
SELECT 
  ak.key,
  ak.type,
  COUNT(au.id) as total_calls,
  ak.usageCount
FROM "ApiKey" ak
LEFT JOIN "ApiUsage" au ON ak.id = au.apiKeyId
GROUP BY ak.id;

-- API calls by endpoint
SELECT 
  endpoint,
  COUNT(*) as call_count,
  AVG(CASE WHEN responseStatus = 200 THEN 1 ELSE 0 END) as success_rate
FROM "ApiUsage"
GROUP BY endpoint;
```

## 🔒 Security Considerations

1. **API Key Security**:
   - Store keys hashed (consider bcrypt for production)
   - Implement rate limiting per key
   - Monitor for abuse patterns

2. **Payment Verification**:
   - Always verify transactions on-chain
   - Check recipient wallet matches
   - Verify amount is correct
   - Prevent double-spending

3. **Rate Limiting**:
   - Implement per-key limits
   - Add IP-based rate limiting
   - Use Redis for distributed rate limiting

4. **Error Handling**:
   - Never expose internal errors
   - Log all failures
   - Implement retry logic for blockchain calls

## 🐛 Troubleshooting

### Payment Not Verifying
- Check transaction signature is correct
- Verify transaction is confirmed on-chain
- Check recipient wallet address matches
- Review server logs for errors

### API Key Not Working
- Verify key is active (`isActive: true`)
- Check rate limit not exceeded
- Ensure correct header format: `x-api-key: unr_research_...`
- Verify user is token holder

### Wallet Verification Fails
- Check Solana RPC connection
- Verify token mint address
- Ensure wallet has token balance > 0
- Check network (mainnet vs devnet)

## 📝 Next Steps

### Pending Features:
- [ ] Rate limiting middleware implementation
- [ ] API key rotation system
- [ ] Webhook notifications for payments
- [ ] Usage dashboard for API key holders
- [ ] Special handling for 'unrepo' GitHub link
- [ ] Advanced analytics and reporting
- [ ] API documentation page
- [ ] SDK for popular languages (Python, JavaScript, Go)

### Future Enhancements:
- [ ] Subscription tiers (monthly/yearly)
- [ ] Team API keys with shared quotas
- [ ] Custom rate limits per tier
- [ ] API usage billing system
- [ ] Webhook integrations
- [ ] GraphQL API alternative

## 📚 Documentation

- **Pay-AI Integration**: `docs/PAYAI_INTEGRATION.md`
- **API Reference**: Coming soon
- **SDK Documentation**: Coming soon
- **Example Projects**: Coming soon

## 🆘 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Pay-AI integration guide
3. Check Solana blockchain explorer
4. Review application logs

---

**Stage 2 Status**: ✅ Core features complete
**Ready for**: Testing and Pay-AI integration
**Next**: Implement rate limiting and unrepo special handler
