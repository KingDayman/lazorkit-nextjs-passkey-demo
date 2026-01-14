/**
 * Solana blockchain utilities
 * Handles wallet derivation and transaction creation
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * Get Solana connection instance
 */
export function getConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

/**
 * Derive a Solana keypair from a passkey public key
 * NOTE: This is a simplified derivation for demo purposes
 * In production, use proper key derivation (BIP32/44) or smart wallet schemes
 */
export function deriveKeypairFromPasskey(passkeyPublicKey: Uint8Array): Keypair {
  // Hash the passkey public key to create a seed
  // This is deterministic: same passkey = same wallet
  const seed = new Uint8Array(32);
  
  // Simple derivation: hash the public key to get 32 bytes
  // Using a basic approach for demo - production should use proper KDF
  for (let i = 0; i < 32; i++) {
    seed[i] = passkeyPublicKey[i % passkeyPublicKey.length] ^ (i * 7);
  }
  
  // Create keypair from seed
  const keypair = Keypair.fromSeed(seed);
  return keypair;
}

/**
 * Create a wallet address from passkey public key
 */
export function createWalletFromPasskey(passkeyPublicKey: Uint8Array): {
  keypair: Keypair;
  address: string;
  publicKey: string;
} {
  const keypair = deriveKeypairFromPasskey(passkeyPublicKey);
  const address = keypair.publicKey.toBase58();
  const publicKey = bs58.encode(keypair.publicKey.toBytes());

  return {
    keypair,
    address,
    publicKey,
  };
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const connection = getConnection();
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return 0;
  }
}

/**
 * Request airdrop on devnet
 */
export async function requestAirdrop(address: string, amount: number = 1): Promise<string> {
  try {
    const connection = getConnection();
    const publicKey = new PublicKey(address);
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw new Error(`Airdrop failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a gasless (sponsored) transaction
 * The sponsor wallet pays the transaction fee
 */
export async function createGaslessTransaction(
  userWallet: PublicKey,
  recipientAddress: string,
  amountSOL: number,
  sponsorKeypair: Keypair
): Promise<Transaction> {
  const connection = getConnection();
  const recipient = new PublicKey(recipientAddress);

  // Create transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: userWallet,
    toPubkey: recipient,
    lamports: amountSOL * LAMPORTS_PER_SOL,
  });

  // Create transaction with sponsor as fee payer
  const transaction = new Transaction();
  transaction.add(transferInstruction);
  
  // Set the fee payer to sponsor wallet (this is the "gasless" part)
  transaction.feePayer = sponsorKeypair.publicKey;
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  return transaction;
}

/**
 * Create a memo transaction (gasless demo alternative)
 * This is safer for demos as it doesn't transfer funds
 */
export async function createMemoTransaction(
  userWallet: PublicKey,
  memo: string,
  sponsorKeypair: Keypair
): Promise<Transaction> {
  const connection = getConnection();

  // Memo program ID
  const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  // Create memo instruction
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf-8'),
  });

  // Create transaction with sponsor as fee payer
  const transaction = new Transaction();
  transaction.add(memoInstruction);
  
  // Set the fee payer to sponsor wallet (gasless!)
  transaction.feePayer = sponsorKeypair.publicKey;
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  return transaction;
}

/**
 * Sign and send a sponsored transaction
 */
export async function sendSponsoredTransaction(
  transaction: Transaction,
  userKeypair: Keypair,
  sponsorKeypair: Keypair
): Promise<string> {
  try {
    const connection = getConnection();

    // User signs the transaction (authorizes the action)
    transaction.partialSign(userKeypair);
    
    // Sponsor signs the transaction (pays the fee)
    transaction.partialSign(sponsorKeypair);

    // Send and confirm
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Solana explorer URL for transaction
 */
export function getExplorerUrl(signature: string, cluster: string = SOLANA_NETWORK): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
