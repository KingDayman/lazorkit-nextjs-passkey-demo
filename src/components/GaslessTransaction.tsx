'use client';

import { useState } from 'react';
import { executeGaslessTransaction, type LazorkitWallet } from '@/lib/lazorkit';
import { getExplorerUrl } from '@/lib/solana';

interface GaslessTransactionProps {
  wallet: LazorkitWallet;
}

export default function GaslessTransaction({ wallet }: GaslessTransactionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const [sponsor, setSponsor] = useState<string | null>(null);
  const [feeSaved, setFeeSaved] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState('Hello from Lazorkit! 🚀');

  const handleSendTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Preparing gasless transaction...');
    setSignature(null);
    setSponsor(null);
    setFeeSaved(null);

    try {
      setStatus('Creating transaction with sponsor...');
      
      const result = await executeGaslessTransaction(wallet, memo);
      
      setStatus('Transaction confirmed! ✅');
      setSignature(result.signature);
      setSponsor(result.sponsor);
      setFeeSaved(result.feeSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setStatus('Transaction failed ❌');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        ⚡ Gasless Transaction Demo
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Memo Message:
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter a message to write on-chain"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will create a memo transaction on Solana Devnet
          </p>
        </div>

        <button
          onClick={handleSendTransaction}
          disabled={isLoading || !memo.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Send Gasless Transaction'}
        </button>

        {status && (
          <div className={`p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm font-medium ${error ? 'text-red-700' : 'text-blue-700'}`}>
              {status}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {signature && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-semibold text-green-800">
                Transaction Signature:
              </label>
              <code className="block mt-1 bg-white px-3 py-2 rounded border border-green-300 text-xs break-all">
                {signature}
              </code>
            </div>

            {sponsor && (
              <div>
                <label className="text-sm font-semibold text-green-800">
                  Sponsor (Fee Payer):
                </label>
                <code className="block mt-1 bg-white px-3 py-2 rounded border border-green-300 text-xs break-all">
                  {sponsor}
                </code>
              </div>
            )}

            {feeSaved !== null && (
              <div>
                <label className="text-sm font-semibold text-green-800">
                  Transaction Fee Saved:
                </label>
                <p className="mt-1 font-mono font-semibold text-green-700">
                  ~{feeSaved} SOL (paid by sponsor)
                </p>
              </div>
            )}

            <a
              href={getExplorerUrl(signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View on Solana Explorer
            </a>
          </div>
        )}

        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            🎯 What's happening:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Gasless Transaction:</strong> The sponsor wallet pays all transaction fees</li>
            <li><strong>Your wallet signs:</strong> You authorize the action with your passkey</li>
            <li><strong>Sponsor pays:</strong> The sponsor wallet covers the ~0.000005 SOL fee</li>
            <li><strong>Memo program:</strong> Writes your message on-chain (safe for demos)</li>
            <li><strong>Zero cost to you:</strong> You don't need SOL in your wallet to transact</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
