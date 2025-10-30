# 🌾 HarvestLedger Hedera Setup Guide

This guide walks you through getting Hedera testnet credentials and creating the required blockchain resources.

## 📋 Overview

You need these Hedera resources for HarvestLedger:

- **HCS Topic ID**: For logging immutable supply chain events
- **Smart Contract ID**: For automated loan agreements
- **Testnet Account**: Your Hedera account credentials

## 🔑 Step 1: Get Hedera Testnet Credentials

### Create Hedera Account

1. **Visit Hedera Portal**: Go to [portal.hedera.com](https://portal.hedera.com)
2. **Sign Up**: Create a free account with your email
3. **Verify Email**: Check your email and verify your account
4. **Access Testnet**: Navigate to "Testnet Access" in the portal

### Generate Testnet Credentials

1. **Create Testnet Account**: Click "Create Testnet Account"
2. **Get Account ID**: Copy your Account ID (format: `0.0.XXXXXX`)
3. **Get Private Key**: Copy your Private Key (long hex string)
4. **Save Credentials**: Store these securely - you'll need them for the .env file

### Example Credentials

```
Account ID: 0.0.123456
Private Key: 302e020100300506032b657004220420abcd1234...
```

## 📝 Step 2: Configure Environment

### Update .env File

1. **Copy Template**: `cp .env.example .env`
2. **Edit .env**: Add your Hedera credentials

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.123456
OPERATOR_KEY=302e020100300506032b657004220420abcd1234...
HEDERA_RPC_URL=https://testnet.hashio.io/api

# These will be created by the setup scripts
HCS_TOPIC_ID=0.0.YOUR_TOPIC_ID
LOAN_CONTRACT_ID=0.0.YOUR_CONTRACT_ID
```

## 🚀 Step 3: Create Hedera Resources

### Option 1: Automated Setup (Recommended)

```bash
# Run complete Hedera setup
python3 scripts/setup_hedera.py
```

### Option 2: Manual Setup

```bash
# Create HCS topic for supply chain logging
python3 scripts/create_topic.py

# Deploy smart contract for loans
python3 scripts/deploy_contract.py
```

### Option 3: Individual Commands

```bash
# Just create a topic
python3 scripts/create_topic.py

# Just deploy contract
python3 scripts/deploy_contract.py
```

## 📊 What Each Resource Does

### HCS Topic (Hedera Consensus Service)

- **Purpose**: Immutable logging of supply chain events
- **Usage**: Every harvest record is logged here
- **Benefits**:
  - Tamper-proof audit trail
  - Timestamped events
  - Public verifiability
- **Example ID**: `0.0.123456`

### Smart Contract (Loan Automation)

- **Purpose**: Automated loan agreements
- **Usage**: Handles loan creation, collateral, and repayment
- **Benefits**:
  - Trustless automation
  - Transparent terms
  - Automatic execution
- **Example ID**: `0.0.789012`

## 🔍 Verification

### Check Your Setup

After running the setup scripts, verify your .env file contains:

```env
# Should be populated automatically
HCS_TOPIC_ID=0.0.123456
LOAN_CONTRACT_ID=0.0.789012
```

### Test the Integration

1. **Start Application**: `./scripts/start.sh`
2. **Create Account**: Register via the frontend
3. **Record Harvest**: Test HCS integration
4. **Create Loan**: Test smart contract integration
5. **Check HashScan**: View your transactions

## 🌐 Monitoring Your Resources

### HashScan Explorer

Monitor your Hedera resources on [HashScan](https://hashscan.io/testnet):

- **Your Account**: `https://hashscan.io/testnet/account/0.0.YOUR_ACCOUNT_ID`
- **Your Topic**: `https://hashscan.io/testnet/topic/0.0.YOUR_TOPIC_ID`
- **Your Contract**: `https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID`

### Mirror Node API

Query real-time data directly:

```bash
# Get topic messages
curl "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.YOUR_TOPIC_ID/messages"

# Get account info
curl "https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.YOUR_ACCOUNT_ID"
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Invalid Account ID or Private Key"

- **Cause**: Incorrect credentials in .env
- **Solution**: Double-check your Account ID and Private Key from Hedera Portal
- **Format**: Account ID should be `0.0.XXXXXX`, Private Key should be hex string

#### 2. "Insufficient Account Balance"

- **Cause**: Your testnet account needs HBAR for transactions
- **Solution**: Get free testnet HBAR from Hedera Portal
- **Note**: Testnet HBAR is free and automatically provided

#### 3. "Network Connection Failed"

- **Cause**: Cannot connect to Hedera testnet
- **Solution**: Check internet connection and firewall settings
- **Alternative**: Use mock mode for development

#### 4. "Topic Creation Failed"

- **Cause**: Various network or credential issues
- **Solution**: Check logs and retry
- **Fallback**: Use mock topic ID for development

### Mock Mode for Development

If you can't get real Hedera credentials, the application works with mock implementations:

```env
# Mock values for development
HCS_TOPIC_ID=0.0.123456
LOAN_CONTRACT_ID=0.0.789012
```

The application will simulate blockchain operations for development and testing.

## 💰 Costs

### Testnet (Free)

- **Account Creation**: Free
- **HBAR Balance**: Free testnet HBAR provided
- **Transactions**: Free on testnet
- **Topic Creation**: ~$0.01 worth of testnet HBAR
- **Contract Deployment**: ~$5 worth of testnet HBAR

### Mainnet (Production)

- **Topic Creation**: ~$0.01 USD
- **Contract Deployment**: ~$5 USD
- **Transaction Fees**: ~$0.0001 USD per transaction
- **Very Low Cost**: Hedera is designed for high-volume, low-cost applications

## 🔐 Security Best Practices

### Credential Management

1. **Never Commit**: Don't commit .env files to version control
2. **Use Environment Variables**: In production, use secure environment variable management
3. **Rotate Keys**: Regularly rotate private keys in production
4. **Separate Environments**: Use different accounts for dev/staging/production

### Network Security

1. **Use HTTPS**: Always use secure connections
2. **Validate Inputs**: Validate all data before blockchain submission
3. **Monitor Transactions**: Set up alerts for unusual activity
4. **Backup Keys**: Securely backup your private keys

## 📚 Additional Resources

### Documentation

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)
- [Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)

### Tools

- [Hedera Portal](https://portal.hedera.com) - Account management
- [HashScan](https://hashscan.io) - Blockchain explorer
- [Hedera Faucet](https://portal.hedera.com) - Free testnet HBAR

### Community

- [Hedera Discord](https://discord.com/invite/hedera)
- [Hedera GitHub](https://github.com/hashgraph)
- [Developer Forum](https://github.com/hashgraph/hedera-improvement-proposal/discussions)

## 🎯 Next Steps

After completing this setup:

1. **Start Development**: `./scripts/start.sh`
2. **Test Features**: Create harvests and loans
3. **Monitor Blockchain**: Watch transactions on HashScan
4. **Deploy to Production**: Use mainnet credentials when ready
5. **Scale Up**: Add more features using Hedera services

Your HarvestLedger application is now ready with full blockchain integration! 🎉
