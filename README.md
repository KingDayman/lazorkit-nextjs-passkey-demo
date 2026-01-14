# Lazorkit Passkey Smart Wallet Demo

A working demonstration of **Lazorkit's** passkey authentication and gasless transaction features on Solana Devnet.

## 🎯 What This Demo Shows

This repository demonstrates three core Lazorkit features:

1. **Passkey Authentication** - Passwordless wallet creation and recovery using WebAuthn
2. **Smart Wallet Derivation** - Deterministic wallet addresses derived from passkey credentials
3. **Gasless Transactions** - Sponsor-paid transactions enabling zero-friction UX

## 🚀 Lazorkit Features Demonstrated

### Passkey Authentication
- **No passwords or seed phrases** - Uses device biometrics (Face ID, Touch ID, Windows Hello)
- **Deterministic wallets** - Same passkey always generates the same wallet address
- **Session persistence** - Maintains wallet session across browser refreshes
- **Platform-native security** - Leverages OS-level cryptographic security

### Gasless Transactions
- **Sponsor pays fees** - Transaction fees are paid by a sponsor wallet
- **Zero SOL required** - Users can interact without holding SOL for gas
- **Transparent sponsorship** - Clear visibility into who pays what
- **Memo transactions** - Safe demo using Solana's memo program

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Modern browser** with WebAuthn support:
  - Chrome 67+
  - Safari 14+
  - Firefox 60+
  - Edge 18+
- **HTTPS or localhost** - WebAuthn requires secure context
- **Biometric device** (optional but recommended) - Face ID, Touch ID, or Windows Hello

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/lazorkit-passkey-demo.git
cd lazorkit-passkey-demo
