/**
 * Passkey (WebAuthn) authentication utilities
 * Handles credential creation and authentication using browser passkeys
 */
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';


const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'Lazorkit Passkey Demo';
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

/**
 * Generate a unique challenge for WebAuthn
 */
function generateChallenge(): Uint8Array {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Convert Uint8Array to base64url string
 */
function bufferToBase64url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert base64url string to Uint8Array
 */
function base64urlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Create a new passkey credential
 * This registers a new passkey with the user's device
 */
export async function createPasskey(username: string): Promise<{
  credentialId: string;
  publicKey: Uint8Array;
  rawId: ArrayBuffer;
}> {
  try {
    const challenge = generateChallenge();
    const userId = crypto.getRandomValues(new Uint8Array(32));

    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge: bufferToBase64url(challenge),
      rp: {
        name: RP_NAME,
        id: RP_ID,
      },
      user: {
        id: bufferToBase64url(userId),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        residentKey: 'required',
        userVerification: 'required',
      },
    };

    const credential = await startRegistration(options);

    // Extract public key from credential
    const publicKeyBytes = base64urlToBuffer(credential.response.publicKey!);
    const rawIdBytes = base64urlToBuffer(credential.rawId);

    return {
      credentialId: credential.id,
      publicKey: publicKeyBytes,
      rawId: rawIdBytes.buffer,
    };
  } catch (error) {
    console.error('Passkey creation failed:', error);
    throw new Error(`Failed to create passkey: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Authenticate using an existing passkey
 * This retrieves an existing passkey credential
 */
export async function authenticatePasskey(): Promise<{
  credentialId: string;
  signature: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
}> {
  try {
    const challenge = generateChallenge();

    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge: bufferToBase64url(challenge),
      timeout: 60000,
      rpId: RP_ID,
      userVerification: 'required',
    };

    const credential = await startAuthentication(options);

    return {
      credentialId: credential.id,
      signature: base64urlToBuffer(credential.response.signature),
      authenticatorData: base64urlToBuffer(credential.response.authenticatorData),
      clientDataJSON: base64urlToBuffer(credential.response.clientDataJSON),
    };
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw new Error(`Failed to authenticate with passkey: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if WebAuthn/Passkey is supported in the current browser
 */
export function isPasskeySupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create
  );
}

/**
 * Store credential ID in localStorage for session persistence
 */
export function storeCredentialId(credentialId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('passkey_credential_id', credentialId);
  }
}

/**
 * Retrieve stored credential ID
 */
export function getStoredCredentialId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('passkey_credential_id');
  }
  return null;
}

/**
 * Clear stored credential
 */
export function clearStoredCredential(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('passkey_credential_id');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_public_key');
  }
}
