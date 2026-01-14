'use client';

import { useState } from 'react';
import { isPasskeySupported } from '@/lib/passkey';
import {
  createLazorkitWallet,
  recoverLazorkitWallet,
  hasExistingSession,
  type LazorkitWallet,
} from '@/lib/lazorkit';

interface PasskeyAuthProps {
  onAuthSuccess: (wallet: LazorkitWallet) => void;
}

export default function PasskeyAuth({ onAuthSuccess }: PasskeyAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  const supported = typeof window !== 'undefined' && isPasskeySupported();
  const hasSession = typeof window !== 'undefined' && hasExistingSession();

  const handleCreateWallet = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = await createLazorkitWallet(username);
      onAuthSuccess(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const wallet = await recoverLazorkitWallet();
      onAuthSuccess(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recover wallet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Passkeys Not Supported</h3>
        <p className="text-red-600 text-sm">
          Your browser doesn't support passkeys. Please use a modern browser like Chrome, Safari, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {hasSession ? 'Login with Passkey' : 'Create Wallet with Passkey'}
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!showUsernameInput && !hasSession && (
          <button
            onClick={() => setShowUsernameInput(true)}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Create New Wallet
          </button>
        )}

        {showUsernameInput && (
          <div className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g., alice@example.com)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateWallet}
                disabled={isLoading || !username.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create with Passkey'}
              </button>
              <button
                onClick={() => setShowUsernameInput(false)}
                disabled={isLoading}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {hasSession && (
          <button
            onClick={handleRecoverWallet}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Authenticating...' : 'Login with Existing Passkey'}
          </button>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2">🔐 Passkey authentication:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Uses your device's biometrics (Face ID, Touch ID, etc.)</li>
            <li>No password needed - completely passwordless</li>
            <li>Creates a deterministic Solana wallet from your passkey</li>
            <li>Same passkey = same wallet address every time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
