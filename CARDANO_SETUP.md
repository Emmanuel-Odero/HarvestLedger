# Cardano Integration Setup Guide

This guide will help you set up and configure the Cardano blockchain integration for HarvestLedger.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Blockfrost API Setup](#blockfrost-api-setup)
- [Wallet Installation](#wallet-installation)
- [Testnet Faucet Instructions](#testnet-faucet-instructions)
- [Environment Configuration](#environment-configuration)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

## Overview

HarvestLedger integrates with Cardano blockchain to provide:

- **Native Token Creation**: Tokenize agricultural produce without smart contracts
- **Supply Chain Metadata**: Immutable record-keeping via transaction metadata
- **Multi-Wallet Support**: Compatible with Nami, Eternl, Flint, and Lace wallets
- **Plutus Smart Contracts**: Automated loan agreements with crop token collateral

The integration uses:

- **MeshJS SDK**: Frontend library for Cardano wallet interactions and transactions
- **Blockfrost API**: Backend service for blockchain data queries and transaction submission
- **PyCardano**: Python library for backend Cardano operations

## Prerequisites

Before setting up Cardano integration, ensure you have:

- Docker and Docker Compose V2 installed
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)
- A modern web browser (Chrome, Firefox, or Brave)
- Basic understanding of blockchain wallets and testnet operations

## Blockfrost API Setup

Blockfrost provides hosted API access to Cardano blockchain data. Follow these steps to get your API credentials:

### 1. Create a Blockfrost Account

1. Visit [https://blockfrost.io](https://blockfrost.io)
2. Click **"Sign Up"** in the top right corner
3. Register with your email address or GitHub account
4. Verify your email address

### 2. Create a Project

1. Log in to your Blockfrost dashboard
2. Click **"Add Project"** or **"Create New Project"**
3. Fill in the project details:
   - **Project Name**: `HarvestLedger` (or your preferred name)
   - **Network**: Select **"Cardano Preprod"** for testnet development
4. Click **"Create Project"**

### 3. Get Your Project ID

1. In your project dashboard, locate the **"Project ID"** section
2. Copy your project ID (format: `preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
3. Keep this secure - it's your API authentication key

### 4. Note Your API Endpoint

For Preprod testnet, your API endpoint will be:

```
https://cardano-preprod.blockfrost.io/api/v0
```

For Mainnet (production), it would be:

```
https://cardano-mainnet.blockfrost.io/api/v0
```

### 5. API Rate Limits

Free tier includes:

- **50,000 requests per day**
- **10 requests per second**

This is sufficient for development and testing. For production, consider upgrading to a paid plan.

## Wallet Installation

HarvestLedger supports multiple Cardano wallets. Install at least one of the following:

### Recommended Wallets

#### 1. Lace Wallet (Recommended for Beginners)

**Features**: User-friendly, built by IOG (Cardano developers), excellent UX

**Installation**:

1. Visit [https://www.lace.io](https://www.lace.io)
2. Click **"Download"** and select your browser (Chrome/Edge/Brave)
3. Install the browser extension
4. Open Lace and click **"Create Wallet"**
5. Follow the setup wizard:
   - Write down your 24-word recovery phrase (keep it safe!)
   - Set a wallet password
   - Confirm your recovery phrase
6. Switch to **Preprod Testnet**:
   - Click the network selector (top right)
   - Select **"Preprod"**

#### 2. Nami Wallet

**Features**: Lightweight, fast, popular choice

**Installation**:

1. Visit [https://namiwallet.io](https://namiwallet.io)
2. Click **"Download"** for your browser
3. Install the extension
4. Create a new wallet and save your recovery phrase
5. In Nami settings, switch to **"Preprod Testnet"**

#### 3. Eternl Wallet

**Features**: Advanced features, multi-account support, hardware wallet integration

**Installation**:

1. Visit [https://eternl.io](https://eternl.io)
2. Download the browser extension or mobile app
3. Create a new wallet
4. Save your recovery phrase securely
5. Switch to **Preprod Testnet** in settings

#### 4. Flint Wallet

**Features**: Simple interface, good for beginners

**Installation**:

1. Visit [https://flint-wallet.com](https://flint-wallet.com)
2. Install the browser extension
3. Create a new wallet
4. Save your recovery phrase
5. Switch to **Preprod Testnet** in settings

### Important Wallet Security Tips

⚠️ **CRITICAL**: Your recovery phrase is the ONLY way to recover your wallet

- Write it down on paper (never store digitally)
- Store it in a secure location
- Never share it with anyone
- Never enter it on any website except your wallet

## Testnet Faucet Instructions

To test Cardano features, you need testnet ADA (tADA). Here's how to get it:

### Method 1: Cardano Testnet Faucet (Recommended)

1. **Get Your Wallet Address**:

   - Open your Cardano wallet (Lace, Nami, etc.)
   - Ensure you're on **Preprod Testnet**
   - Copy your wallet address (starts with `addr_test1...`)

2. **Visit the Faucet**:

   - Go to [https://docs.cardano.org/cardano-testnet/tools/faucet/](https://docs.cardano.org/cardano-testnet/tools/faucet/)
   - Or directly: [https://testnets.cardano.org/en/testnets/cardano/tools/faucet/](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

3. **Request Testnet ADA**:

   - Select **"Preprod Testnet"**
   - Paste your wallet address
   - Complete the CAPTCHA
   - Click **"Request Funds"**

4. **Wait for Confirmation**:

   - Funds typically arrive within 1-5 minutes
   - You'll receive **1000 tADA** per request
   - Check your wallet balance

5. **Request Limits**:
   - One request per address per 24 hours
   - If you need more, create additional test wallets

### Method 2: Community Faucets

Alternative faucets (if the official one is down):

- **Testnets Cardano**: [https://testnets.cardano.org/en/testnets/cardano/tools/faucet/](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)
- **Cardano Faucet**: Check Cardano Discord or Reddit for community-run faucets

### Verifying Your Balance

After requesting funds:

1. Open your wallet
2. Check that you're on **Preprod Testnet**
3. Your balance should show ~1000 tADA
4. If not visible after 5 minutes, try refreshing or restarting your wallet

## Environment Configuration

### 1. Update Your .env File

Copy the example environment file and add your Cardano credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Blockfrost credentials:

```env
# Cardano Configuration
CARDANO_NETWORK=preprod
BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXX
BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0
```

### 2. Configuration Options

#### Network Selection

For **development/testing** (recommended):

```env
CARDANO_NETWORK=preprod
BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0
```

For **production** (when ready):

```env
CARDANO_NETWORK=mainnet
BLOCKFROST_API_URL=https://cardano-mainnet.blockfrost.io/api/v0
```

#### Optional: Mock Mode for Development

If you don't have Blockfrost credentials yet, the backend will use mock mode:

```env
# Leave BLOCKFROST_PROJECT_ID empty for mock mode
BLOCKFROST_PROJECT_ID=
```

Mock mode provides simulated responses for development without real blockchain interaction.

### 3. Verify Configuration

Check that your configuration is loaded correctly:

```bash
# Start the services
make dev

# Check backend logs for Cardano initialization
make logs backend

# You should see:
# "Cardano client initialized for network: preprod"
# "Blockfrost API connected successfully"
```

## Testing Your Setup

### 1. Start the Application

```bash
make dev
```

Wait for all services to start (check with `make status`).

### 2. Access the Cardano Dashboard

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. Navigate to **Dashboard** → **Cardano Integration**
3. You should see the Cardano integration interface

### 3. Connect Your Wallet

1. Click **"Connect Cardano Wallet"**
2. Select your installed wallet (Lace, Nami, etc.)
3. Approve the connection in your wallet popup
4. Your wallet address and balance should display

### 4. Test Token Minting

1. In the Cardano dashboard, go to **"Token Minting"**
2. Fill in the crop tokenization form:
   - **Crop Type**: e.g., "Organic Tomatoes"
   - **Quantity**: e.g., "100"
   - **Harvest Date**: Select a date
   - **Location**: e.g., "Farm A, Kenya"
3. Click **"Mint Token"**
4. Approve the transaction in your wallet
5. Wait for confirmation (usually 20-60 seconds)
6. Your new token should appear in your wallet

### 5. Test Token Transfer

1. Create a second test wallet (or use a friend's testnet address)
2. In the Cardano dashboard, go to **"Token Transfer"**
3. Enter:
   - **Recipient Address**: The destination address
   - **Token**: Select your minted token
   - **Quantity**: Amount to transfer
4. Click **"Transfer"**
5. Approve the transaction
6. Verify the transfer in both wallets

### 6. Verify Blockchain Data

1. Copy a transaction hash from your dashboard
2. Visit [https://preprod.cardanoscan.io](https://preprod.cardanoscan.io)
3. Paste the transaction hash in the search bar
4. View your transaction details, metadata, and token transfers

## Troubleshooting

### Wallet Connection Issues

**Problem**: "No wallet detected"

- **Solution**: Ensure your wallet extension is installed and enabled
- Refresh the page after installing the wallet
- Try a different browser if issues persist

**Problem**: "Wallet connection failed"

- **Solution**: Check that your wallet is unlocked
- Ensure you're on the correct network (Preprod)
- Try disconnecting and reconnecting

### Blockfrost API Errors

**Problem**: "Blockfrost authentication failed"

- **Solution**: Verify your `BLOCKFROST_PROJECT_ID` in `.env`
- Ensure there are no extra spaces or quotes
- Check that your project is active in Blockfrost dashboard

**Problem**: "Rate limit exceeded"

- **Solution**: You've hit the 50,000 daily request limit
- Wait 24 hours or upgrade your Blockfrost plan
- Use mock mode for development: remove `BLOCKFROST_PROJECT_ID`

### Transaction Failures

**Problem**: "Insufficient ADA for transaction fees"

- **Solution**: Request more testnet ADA from the faucet
- Each transaction requires ~0.2-2 ADA for fees
- Ensure you have at least 5 tADA for testing

**Problem**: "Transaction timeout"

- **Solution**: Cardano transactions can take 20-60 seconds
- Wait longer before retrying
- Check Cardano network status: [https://cardanostatus.com](https://cardanostatus.com)

**Problem**: "Invalid metadata format"

- **Solution**: Check that your metadata follows CIP-25 standards
- Ensure all required fields are present
- Review backend logs for specific validation errors

### Network Issues

**Problem**: "Wrong network detected"

- **Solution**: Switch your wallet to Preprod testnet
- Restart your wallet after switching networks
- Clear browser cache if issues persist

**Problem**: "Cannot connect to Cardano network"

- **Solution**: Check your internet connection
- Verify Blockfrost API status: [https://status.blockfrost.io](https://status.blockfrost.io)
- Try restarting the backend service: `make restart-backend`

### Docker Issues

**Problem**: "Cardano environment variables not loaded"

- **Solution**: Ensure `.env` file exists in project root
- Restart Docker services: `make stop && make dev`
- Check that `env_file: - .env` is in `docker-compose.yml`

**Problem**: "Backend fails to start with Cardano errors"

- **Solution**: Check backend logs: `make logs backend`
- Verify all Cardano dependencies are installed
- Try rebuilding: `make clean && make build && make dev`

## Additional Resources

### Documentation

- **Cardano Official Docs**: [https://docs.cardano.org](https://docs.cardano.org)
- **MeshJS Documentation**: [https://meshjs.dev](https://meshjs.dev)
- **Blockfrost API Docs**: [https://docs.blockfrost.io](https://docs.blockfrost.io)
- **PyCardano Docs**: [https://pycardano.readthedocs.io](https://pycardano.readthedocs.io)

### Explorers

- **Preprod Explorer**: [https://preprod.cardanoscan.io](https://preprod.cardanoscan.io)
- **Mainnet Explorer**: [https://cardanoscan.io](https://cardanoscan.io)
- **Alternative Explorer**: [https://explorer.cardano.org](https://explorer.cardano.org)

### Community

- **Cardano Forum**: [https://forum.cardano.org](https://forum.cardano.org)
- **Cardano Stack Exchange**: [https://cardano.stackexchange.com](https://cardano.stackexchange.com)
- **Discord**: Join the Cardano Discord for community support
- **Reddit**: [r/cardano](https://reddit.com/r/cardano)

### Development Tools

- **Cardano CLI**: For advanced operations
- **Plutus Playground**: For smart contract development
- **Cardano Serialization Library**: Low-level transaction building

## Next Steps

Once your Cardano setup is complete:

1. ✅ Explore the multi-chain features (switch between Hedera and Cardano)
2. ✅ Test supply chain metadata recording
3. ✅ Experiment with token transfers
4. ✅ Review transaction history and verification
5. ✅ Read the main README.md for additional features

For production deployment, see the deployment guide and ensure you:

- Switch to Cardano mainnet
- Use production Blockfrost credentials
- Secure your environment variables
- Test thoroughly on testnet first

---

**Need Help?** Check the [Troubleshooting](#troubleshooting) section or open an issue on GitHub.
