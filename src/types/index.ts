/**
 * Type definitions for Lazorkit Passkey Demo
 */

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  rawId: ArrayBuffer;
}

export interface WalletState {
  address: string | null;
  publicKey: string | null;
  credentialId: string | null;
  isAuthenticated: boolean;
}

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  signature?: string;
  message?: string;
  error?: string;
}

export interface GaslessTransactionParams {
  walletAddress: string;
  recipientAddress: string;
  amount: number;
}

export interface PasskeyAuthResult {
  success: boolean;
  walletAddress?: string;
  publicKey?: string;
  credentialId?: string;
  error?: string;
}

export interface SponsoredTransaction {
  transaction: string; // Base64 encoded transaction
  signature: string;
  sponsor: string;
  feePayer: string;
}
