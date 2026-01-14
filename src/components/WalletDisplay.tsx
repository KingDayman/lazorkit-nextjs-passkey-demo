'use client';

import { useState, useEffect } from 'react';
import { getWalletBalance } from '@/lib/solana';
import type { LazorkitWallet } from '@/lib/lazorkit';

interface WalletDisplayProps {
  wallet: LazorkitWallet;
}

export default function WalletDisplay({ wallet }: WalletDisplayProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, [wallet.address]);

  const loadBalance = async () => {
    setIsLoading(true);
    try {
      const bal = await getWalletBalance(wallet.address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        ✅ Wallet Connected
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Address:</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-xs break-all">
              {wallet.address}
            </code>
            <button
              onClick={copyAddress}
              className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Balance:</label>
          <div className="mt-1 bg-white px-3 py-2 rounded border border-gray-200">
            {isLoading ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : (
              <span className="font-mono font-semibold">
                {balance?.toFixed(4)} SOL
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Credential ID:</label>
          <code className="block mt-1 bg-white px-3 py-2 rounded border border-gray-200 text-xs break-all">
            {wallet.credentialId.substring(0, 40)}...
          </code>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
        <p className="font-semibold mb-1">💡 This is a Lazorkit Smart Wallet:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Controlled by your passkey (no private key to manage)</li>
          <li>Deterministic address derived from passkey</li>
          <li>Supports gasless transactions (sponsor pays fees)</li>
          <li>Network: Solana Devnet</li>
        </ul>
      </div>

      <button
        onClick={loadBalance}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Refresh Balance
      </button>
    </div>
  );
}
