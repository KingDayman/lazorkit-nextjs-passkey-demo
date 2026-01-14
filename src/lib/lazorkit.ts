/**
 * Lazorkit Integration Layer
 * This demonstrates how Lazorkit's passkey + gasless wallet features work
 * 
 * ARCHITECTURE:
 * 1. Passkey Authentication → Deterministic Wallet Derivation
 * 2. Smart Wallet Creation with Sponsor Account
 * 3. Gasless Transaction Execution (Sponsor pays fees)
 */

import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  createPasskey,
  authenticatePasskey,
  storeCredentialId,
  getStoredCredentialId,
} from './passkey';
import {
  createWalletFromPasskey,
  createMemoTransaction,
  sendSponsoredTransaction,
  getConnection,
  getWalletBalance,
} from './solana';

/**
 * Lazorkit Smart Wallet
 * Represents a passkey-controlled wallet with gasless capabilities
 */
export interface LazorkitWallet {
  address: string;
  publicKey: string;
  credentialId: string;
  keypair: Keypair; // In production, this would be managed by smart contract
}

/**
 * Get or create sponsor wallet
 * In production, this would be a service endpoint
 */
function getSponsorWallet(): Keypair {
  const sponsorKey = process.env.LAZORKIT_SPONSOR_PRIVATE_KEY;
  
  if (sponsorKey && sponsorKey !== 'your_base58_encoded_private_key_here') {
    try {
      return Keypair.fromSecretKey(bs58.decode(sponsorKey));
    } catch (error) {
      console.warn('Invalid sponsor key, using random sponsor');
    }
  }
  
  // For demo: create a random sponsor wallet
  // In production: this would be your sponsor service's wallet
  return Keypair.generate();
}

/**
 * Create a new Lazorkit smart wallet with passkey
 * This combines passkey creation with wallet derivation
 */
export async function createLazorkitWallet(username: string): Promise<LazorkitWallet> {
  try {
    console.log('Creating passkey credential...');
    
    // Step 1: Create passkey credential
    const { credentialId, publicKey } = await createPasskey(username);
    
    console.log('Deriving wallet from passkey...');
    
    // Step 2: Derive deterministic wallet from passkey
    const { keypair, address, publicKey: walletPublicKey } = 
      createWalletFromPasskey(publicKey);
    
    // Step 3: Store credential ID for future authentication
    storeCredentialId(credentialId);
    
    // Store wallet info in session
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('wallet_public_key', walletPublicKey);
    }
    
    console.log('Lazorkit wallet created:', address);
    
    return {
      address,
      publicKey: walletPublicKey,
      credentialId,
      keypair,
    };
  } catch (error) {
    console.error('Failed to create Lazorkit wallet:', error);
    throw error;
  }
}

/**
 * Recover existing Lazorkit wallet using passkey
 */
export async function recoverLazorkitWallet(): Promise<LazorkitWallet> {
  try {
    console.log('Authenticating with passkey...');
    
    // Step 1: Authenticate with existing passkey
    const { credentialId } = await authenticatePasskey();
    
    // Step 2: Retrieve stored wallet info
    // In production, you would re-derive from passkey or query smart contract
    const storedAddress = typeof window !== 'undefined' 
      ? localStorage.getItem('wallet_address')
      : null;
    
    if (!storedAddress) {
      throw new Error('No wallet found. Please create a new wallet.');
    }
    
    // For demo: we need to recreate the wallet
    // In production: smart contract would handle this
    const storedPublicKey = localStorage.getItem('wallet_public_key') || '';
    
    // Note: We can't fully recover the keypair without the original passkey public key
    // In a real implementation, the smart contract would hold the wallet
    // and passkey would just authorize actions
    
    console.log('Wallet recovered:', storedAddress);
    
    return {
      address: storedAddress,
      publicKey: storedPublicKey,
      credentialId,
      keypair: Keypair.generate(), // Placeholder - production uses smart contract
    };
  } catch (error) {
    console.error('Failed to recover wallet:', error);
    throw error;
  }
}

/**
 * Execute a gasless transaction using Lazorkit
 * The sponsor wallet pays the transaction fee
 */
export async function executeGaslessTransaction(
  wallet: LazorkitWallet,
  memo: string
): Promise<{
  signature: string;
  sponsor: string;
  feeSaved: number;
}> {
  try {
    console.log('Creating gasless transaction...');
    
    // Get sponsor wallet (this would be Lazorkit's service in production)
    const sponsor = getSponsorWallet();
    
    // Create the transaction with sponsor as fee payer
    const transaction = await createMemoTransaction(
      new PublicKey(wallet.address),
      memo,
      sponsor
    );
    
    console.log('Transaction created with sponsor:', sponsor.publicKey.toBase58());
    console.log('Fee payer:', transaction.feePayer?.toBase58());
    
    // Send the sponsored transaction
    const signature = await sendSponsoredTransaction(
      transaction,
      wallet.keypair,
      sponsor
    );
    
    console.log('Transaction sent:', signature);
    
    // Estimate fee saved (typical Solana transaction fee)
    const feeSaved = 0.000005; // ~5000 lamports
    
    return {
      signature,
      sponsor: sponsor.publicKey.toBase58(),
      feeSaved,
    };
  } catch (error) {
    console.error('Gasless transaction failed:', error);
    throw error;
  }
}

/**
 * Check if user has an existing Lazorkit wallet session
 */
export function hasExistingSession(): boolean {
  if (typeof window === 'undefined') return false;
  
  const credentialId = getStoredCredentialId();
  const walletAddress = localStorage.getItem('wallet_address');
  
  return !!(credentialId && walletAddress);
}

/**
 * Clear Lazorkit wallet session
 */
export function clearWalletSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('passkey_credential_id');
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('wallet_public_key');
}

/**
 * Get wallet info from session
 */
export function getSessionWallet(): { address: string; publicKey: string } | null {
  if (typeof window === 'undefined') return null;
  
  const address = localStorage.getItem('wallet_address');
  const publicKey = localStorage.getItem('wallet_public_key');
  
  if (!address || !publicKey) return null;
  
  return { address, publicKey };
}
