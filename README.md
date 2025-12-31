# UnRepo

<div align="center">
  <img src="./public/IMG_1359.JPG" alt="UnRepo Banner" width="800"/>
  
  ### AI-Powered GitHub Repository Intelligence Platform
  
  *Analyze, chat, and gain insights from any GitHub repository using advanced AI*

  [![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
  [![Solana](https://img.shields.io/badge/Solana-Web3-14F195?style=for-the-badge&logo=solana)](https://solana.com/)
  
</div>

---

## 🚀 Features

### 🤖 AI-Powered Repository Chat
- **Interactive Q&A**: Ask questions about any GitHub repository
- **Context-Aware**: AI understands repository structure and code
- **Multi-Turn Conversations**: Maintain context across multiple questions
- **Intelligent Routing**: Automatically selects best AI model for your query

### 🔬 Deep Repository Analysis
- **Code Quality Assessment**: Analyze code patterns and best practices
- **Security Analysis**: Detect potential vulnerabilities and rug-pull patterns
- **Technology Stack Detection**: Identify frameworks and dependencies
- **AI-Generated Insights**: Get comprehensive repository summaries

### 🔑 Developer API Platform
- **RESTful APIs**: Production-ready endpoints for chatbot and research
- **Free Tier**: 5 API calls per key to get started
- **Premium Tier**: Unlimited calls with rate limiting for scale
- **Usage Analytics**: Track API usage and performance metrics

### 💎 Blockchain Integration
- **Solana Wallet Support**: Connect with Phantom, Solflare, and more
- **Token-Gated Features**: Premium access for token holders
- **On-Chain Payments**: Decentralized payment processing
- **Web3 Authentication**: Secure wallet-based login

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS |
| **Backend** | Next.js API Routes, Prisma ORM, PostgreSQL (Neon) |
| **AI/ML** | UnRepo Chat API, UnRepo Research API, Intelligent Routing |
| **Blockchain** | Solana Web3.js, SPL Token, Wallet Adapters |
| **Authentication** | NextAuth.js, GitHub OAuth, Solana Wallets |
| **Database** | PostgreSQL (Neon), Redis (Rate Limiting) |
| **Deployment** | Vercel, Docker Support |
| **APIs** | GitHub REST API, Octokit |

</div>

---

## 📦 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- Redis instance (optional, for rate limiting)
- Solana wallet (for Web3 features)

### 1. Clone Repository
```bash
git clone https://github.com/unrepo-dev/UnRepo-main.git
cd UnRepo-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
GITHUB_ACCESS_TOKEN="your-github-token"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# UnRepo AI APIs
UNREPO_CHAT_API_KEY="unrepo_chatbot_your_key_here"
UNREPO_RESEARCH_API_KEY="unrepo_research_your_key_here"

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔑 API Usage

### Generate API Keys
1. Visit `/developer` page
2. Sign in with GitHub or Solana wallet
3. Click "Generate Key" for Chatbot or Research API
4. Copy your API key (shown only once!)

### Chatbot API
```bash
curl -X POST https://chat.unrepo.dev/api/v1/chatbot \
  -H "Content-Type: application/json" \
  -H "x-api-key: unrepo_chatbot_YOUR_KEY" \
  -d '{
    "message": "What does this repository do?",
    "repoUrl": "https://github.com/vercel/next.js"
  }'
```

### Research API
```bash
curl -X POST https://research.unrepo.dev/api/v1/research \
  -H "Content-Type: application/json" \
  -H "x-api-key: unrepo_research_YOUR_KEY" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js"
  }'
```

---

## 📂 Project Structure

```
UnRepo-main/
├── app/
│   ├── api/               # API routes
│   │   └── v1/            # Versioned APIs
│   │       ├── chatbot/   # Chat API endpoint
│   │       └── research/  # Research API endpoint
│   ├── developer/         # API key management
│   ├── api-docs/          # API documentation
│   └── page.tsx           # Homepage
├── components/            # React components
├── contexts/              # React contexts (Theme, etc.)
├── lib/                   # Utilities
│   ├── ai.ts              # AI integration
│   ├── github.ts          # GitHub API
│   ├── prisma.ts          # Database client
│   └── rateLimit.ts       # Rate limiting
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `UNREPO_CHAT_API_KEY`
- `UNREPO_RESEARCH_API_KEY`
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

### Docker
```bash
docker build -t unrepo .
docker run -p 3000:3000 --env-file .env unrepo
```

---

## 🎯 Features Roadmap

- [x] GitHub repository analysis
- [x] AI-powered chat interface
- [x] Developer API platform
- [x] Solana wallet integration
- [x] Token-gated premium features
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Repository comparison tool
- [ ] Code review automation
- [ ] Team collaboration features
- [ ] Mobile application

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [https://unrepo.dev/docs](https://unrepo.dev/docs)
- **API Reference**: [https://unrepo.dev/api-docs](https://unrepo.dev/api-docs)
- **Issues**: [GitHub Issues](https://github.com/unrepo-dev/UnRepo-main/issues)
- **Discord**: [Join our community](https://discord.gg/unrepo)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Solana](https://solana.com/) - Blockchain platform
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">
  
  **Built with ❤️ by the UnRepo Team**
  
  [Website](https://unrepo.dev) · [API Docs](https://unrepo.dev/api-docs) · [Developer Portal](https://unrepo.dev/developer)
  
</div>
