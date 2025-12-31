import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// USDC Mint Address on Solana Mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Payment configuration
export const PAYMENT_CONFIG = {
  amount: 0.01, // 0.01 USDC
  currency: 'USDC',
  recipientWallet: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '',
};

/**
 * Create a USDC transfer transaction
 * @param connection Solana connection
 * @param senderWallet Sender's wallet public key
 * @param recipientWallet Recipient's wallet public key
 * @param amount Amount in USDC (not micro USDC)
 * @returns Transaction ready to be signed
 */
export async function createUSDCTransferTransaction(
  connection: Connection,
  senderWallet: PublicKey,
  recipientWallet: PublicKey,
  amount: number
): Promise<Transaction> {
  try {
    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      senderWallet
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipientWallet
    );

    // Convert USDC to micro USDC (6 decimals)
    const microAmount = Math.floor(amount * 1_000_000);

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderWallet,
      microAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Build transaction
    const transaction = new Transaction();
    transaction.add(transferInstruction);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderWallet;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    return transaction;
  } catch (error: any) {
    console.error('Error creating USDC transfer transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
}

/**
 * Send USDC payment using wallet adapter
 * @param connection Solana connection
 * @param senderWallet Sender's wallet public key
 * @param recipientWallet Recipient's wallet public key  
 * @param amount Amount in USDC
 * @param sendTransaction Wallet adapter's sendTransaction function
 * @returns Transaction signature
 */
export async function sendUSDCPayment(
  connection: Connection,
  senderWallet: PublicKey,
  recipientWallet: PublicKey,
  amount: number,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<string> {
  try {
    // Create transaction
    const transaction = await createUSDCTransferTransaction(
      connection,
      senderWallet,
      recipientWallet,
      amount
    );

    // Send transaction
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    console.error('Error sending USDC payment:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
}

/**
 * Get USDC balance for a wallet
 * @param connection Solana connection
 * @param walletAddress Wallet public key
 * @returns USDC balance
 */
export async function getUSDCBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletAddress
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.uiAmount?.toString() || '0');
  } catch (error) {
    // Token account doesn't exist or other error
    return 0;
  }
}

/**
 * Verify a transaction on the Solana blockchain
 * @param connection Solana connection
 * @param signature Transaction signature
 * @returns Transaction details if valid
 */
export async function verifyTransaction(
  connection: Connection,
  signature: string
) {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.meta?.err) {
      throw new Error('Transaction failed');
    }

    return {
      signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      success: transaction.meta?.err === null,
    };
  } catch (error: any) {
    console.error('Error verifying transaction:', error);
    throw new Error(`Verification failed: ${error.message}`);
  }
}

/**
 * Check if wallet has sufficient USDC balance
 * @param connection Solana connection
 * @param walletAddress Wallet public key
 * @param requiredAmount Required amount in USDC
 * @returns Boolean indicating if balance is sufficient
 */
export async function hasSufficientBalance(
  connection: Connection,
  walletAddress: PublicKey,
  requiredAmount: number
): Promise<boolean> {
  const balance = await getUSDCBalance(connection, walletAddress);
  return balance >= requiredAmount;
}

/**
 * Format USDC amount for display
 * @param amount Amount in micro USDC
 * @returns Formatted string
 */
export function formatUSDC(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}

/**
 * Get Solana Explorer URL for transaction
 * @param signature Transaction signature
 * @param cluster Network cluster (mainnet-beta, devnet, testnet)
 * @returns Explorer URL
 */
export function getExplorerUrl(
  signature: string,
  cluster: string = 'mainnet-beta'
): string {
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
}
