'use client';

import { useState, useEffect } from 'react';
import PasskeyAuth from '@/components/PasskeyAuth';
import WalletDisplay from '@/components/WalletDisplay';
import GaslessTransaction from '@/components/GaslessTransaction';
import { clearWalletSession, hasExistingSession, type LazorkitWallet } from '@/lib/lazorkit';

export default function Home() {
  const [wallet, setWallet] = useState<LazorkitWallet | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthSuccess = (newWallet: LazorkitWallet) => {
    setWallet(newWallet);
  };

  const handleLogout = () => {
    clearWalletSession();
    setWallet(null);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Lazorkit Passkey Demo
          </h1>
          <p className="text-lg text-gray-600">
            Passwordless Solana Wallet + Gasless Transactions
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              Solana Devnet
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              Passkey Auth
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Gasless Transactions
            </span>
          </div>
        </div>

        {/* Status Bar */}
        {wallet && (
          <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Wallet Connected
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        {/* Main Content */}
        {!wallet ? (
          <PasskeyAuth onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div className="space-y-6">
            <WalletDisplay wallet={wallet} />
            <GaslessTransaction wallet={wallet} />
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📚 About This Demo
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              This demo showcases <strong>Lazorkit's</strong> core features for building
              next-generation Solana applications:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Passkey Authentication:</strong> No passwords, no seed phrases.
                Just your device's biometrics.
              </li>
              <li>
                <strong>Smart Wallet:</strong> Deterministic wallet derived from your passkey.
                Same passkey = same address.
              </li>
              <li>
                <strong>Gasless Transactions:</strong> A sponsor wallet pays transaction fees,
                enabling zero-friction UX.
              </li>
              <li>
                <strong>Solana Devnet:</strong> All transactions happen on Devnet for safe testing.
              </li>
            </ul>
            <p className="mt-3 text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
              <strong>Note:</strong> This is a demo implementation. Production apps would use
              Lazorkit's hosted infrastructure for sponsor management and smart contract wallets.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          <p>Built with Next.js, Solana Web3.js, and WebAuthn</p>
          <p className="mt-1">
            <a
              href="https://github.com/yourusername/lazorkit-passkey-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on GitHub
            </a>
            {' • '}
            <a
              href="/docs/tutorial-passkey-wallet.md"
              className="text-blue-600 hover:underline"
            >
              Documentation
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
