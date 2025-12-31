import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const UNREPO_TOKEN_MINT = process.env.NEXT_PUBLIC_UNREPO_TOKEN_MINT || '';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Get token balance using Helius API for better reliability
export async function getTokenBalance(walletAddress: string): Promise<number> {
  try {
    // Try Helius API first if available
    if (HELIUS_API_KEY) {
      const heliusUrl = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`;
      
      try {
        const response = await fetch(heliusUrl);
        if (response.ok) {
          const data = await response.json();
          
          // Find UnRepo token in the balances
          const unrepoToken = data.tokens?.find((token: any) => token.mint === UNREPO_TOKEN_MINT);
          if (unrepoToken) {
            return unrepoToken.amount / Math.pow(10, unrepoToken.decimals || 9);
          }
        }
      } catch (heliusError) {
        console.warn('Helius API failed, falling back to RPC:', heliusError);
      }
    }

    // Fallback to standard RPC method
    const walletPubkey = new PublicKey(walletAddress);
    const tokenMintPubkey = new PublicKey(UNREPO_TOKEN_MINT);

    // Get token accounts for the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Find the UnRepo token account
    const unrepoTokenAccount = tokenAccounts.value.find(
      (account) => account.account.data.parsed.info.mint === UNREPO_TOKEN_MINT
    );

    if (!unrepoTokenAccount) {
      return 0;
    }

    const balance = unrepoTokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

// Check if wallet holds UnRepo tokens
export async function checkTokenHolder(walletAddress: string): Promise<{
  holdsToken: boolean;
  balance: number;
}> {
  const balance = await getTokenBalance(walletAddress);
  return {
    holdsToken: balance > 0,
    balance,
  };
}

// Verify Solana transaction using Helius for enhanced details
export async function verifyTransaction(transactionSignature: string): Promise<{
  verified: boolean;
  amount?: number;
  from?: string;
  to?: string;
}> {
  try {
    // Try Helius Enhanced Transactions API first
    if (HELIUS_API_KEY) {
      const heliusUrl = `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`;
      
      try {
        const response = await fetch(heliusUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: [transactionSignature],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const tx = data[0];
          
          if (tx && !tx.err) {
            // Parse token transfers from Helius enhanced data
            const tokenTransfers = tx.tokenTransfers || [];
            const usdcTransfer = tokenTransfers.find((t: any) => 
              t.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint
            );

            return {
              verified: true,
              amount: usdcTransfer ? usdcTransfer.tokenAmount : 0.01,
              from: usdcTransfer?.fromUserAccount,
              to: usdcTransfer?.toUserAccount,
            };
          }
        }
      } catch (heliusError) {
        console.warn('Helius transaction API failed, falling back to RPC:', heliusError);
      }
    }

    // Fallback to standard RPC
    const transaction = await connection.getTransaction(transactionSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction || !transaction.meta) {
      return { verified: false };
    }

    // Check if transaction was successful
    if (transaction.meta.err) {
      return { verified: false };
    }

    // Extract transaction details
    return {
      verified: true,
      amount: 0.01, // For now, assume 0.01 USDC
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false };
  }
}

// Validate Solana wallet address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Get wallet info
export async function getWalletInfo(walletAddress: string) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const lamportsBalance = balance / 1e9; // Convert lamports to SOL

    return {
      address: walletAddress,
      balance: lamportsBalance,
      isValid: true,
    };
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    return {
      address: walletAddress,
      balance: 0,
      isValid: false,
    };
  }
}
