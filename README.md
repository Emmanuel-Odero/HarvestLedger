# HarvestLedger 🌾

**Blockchain-powered Agricultural Supply Chain Management**

A modern web application for agriculture supply chain tracking and financing, built with FastAPI, Next.js, and integrated with Hedera blockchain for transparency and tokenization.

## 🏗️ Architecture

- **Backend**: FastAPI + GraphQL (Strawberry) + PostgreSQL + Hedera SDK + PyCardano
- **Frontend**: Next.js 16 + React 19 + Apollo Client + Tailwind CSS + MeshJS
- **Blockchain**: Multi-chain support
  - **Hedera**: Testnet/Mainnet (HCS for logging, HTS for tokenization)
  - **Cardano**: Preprod/Mainnet (Native tokens, Plutus contracts, transaction metadata)
- **Infrastructure**: Docker + Docker Compose + Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose V2
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)

### One-Command Setup

```bash
git clone https://github.com/Emmanuel-Odero/HarvestLedger.git
cd HarvestLedger

# Copy and configure environment
cp .env.example .env
# Edit .env with your Hedera testnet credentials (optional for development)

# Start everything
make dev
```

That's it! 🎉

## 📋 Available Commands

```bash
make help          # Show all available commands
make dev           # Start development environment
make stop          # Stop all services
make logs          # View logs from all services
make status        # Show service status
make health        # Check service health
make clean         # Clean up Docker resources
make deploy-vercel # Deploy frontend to Vercel
```

### 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Environment Test**: http://localhost:3000/env-test
- **Backend API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql
- **API Documentation**: http://localhost:8000/docs
- **PgAdmin**: http://localhost:5050 (admin@harvest.com / admin123)
- **MailHog**: http://localhost:8026 (Email testing)

## ⚙️ Configuration

The application uses a unified `.env` file for all services:

```env
# Hedera Configuration (optional for development)
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.7157029
OPERATOR_KEY=your_private_key_here

# Cardano Configuration (optional for development)
CARDANO_NETWORK=preprod
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here
BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0

# Database (auto-configured for Docker)
DATABASE_URL=postgresql://harvest_user:harvest_pass@db:5432/harvest_ledger

# Frontend (auto-configured for Docker)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql

# JWT & Security
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
```

### Blockchain Configuration

**Hedera Setup** (optional for development):

- Get testnet credentials from [Hedera Portal](https://portal.hedera.com)
- See [HEDERA_SETUP.md](HEDERA_SETUP.md) for detailed instructions

**Cardano Setup** (optional for development):

- Get Blockfrost API key from [Blockfrost.io](https://blockfrost.io)
- Install a Cardano wallet (Lace, Nami, Eternl, or Flint)
- Get testnet ADA from the [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
- See [CARDANO_SETUP.md](CARDANO_SETUP.md) for detailed instructions

**Note**: Both blockchain integrations work in mock mode without credentials for initial development.

## 🛠️ Development Workflow

### Daily Development

```bash
make dev           # Start everything
# Make your changes...
make logs          # Check logs if needed
make stop          # Stop when done
```

### Database Operations

```bash
make db-migrate    # Run migrations
make db-backup     # Backup database
make db-reset      # Reset database (⚠️ destroys data)
```

### Debugging & Maintenance

```bash
make verify        # Verify setup
make health        # Check service health
make shell-backend # Open backend shell
make shell-frontend # Open frontend shell
make clean         # Clean up resources
```

## 🌐 Blockchain Integration

### Cardano Integration

HarvestLedger supports Cardano blockchain for agricultural tokenization and supply chain tracking.

#### Quick Start with Cardano

1. **Get Blockfrost API Key**:

   ```bash
   # Sign up at https://blockfrost.io
   # Create a project for Preprod testnet
   # Copy your project ID
   ```

2. **Install a Cardano Wallet**:

   - [Lace](https://www.lace.io) (Recommended)
   - [Nami](https://namiwallet.io)
   - [Eternl](https://eternl.io)
   - [Flint](https://flint-wallet.com)

3. **Get Testnet ADA**:

   - Visit [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
   - Request testnet ADA for your wallet address

4. **Configure Environment**:

   ```bash
   # Add to .env
   CARDANO_NETWORK=preprod
   BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0
   ```

5. **Start and Test**:
   ```bash
   make dev
   # Navigate to http://localhost:3000/dashboard/cardano-integration
   # Connect your wallet and mint your first crop token!
   ```

#### Cardano Features

**Token Minting**:

```typescript
// Mint a crop token on Cardano
const result = await cardanoTokenService.mintCropToken({
  cropType: "Organic Tomatoes",
  quantity: 100,
  metadata: {
    name: "Organic Tomatoes - Batch #123",
    harvestDate: "2024-01-15",
    location: "Farm A, Kenya",
    certifications: ["Organic", "Fair Trade"],
  },
});
```

**Supply Chain Tracking**:

```typescript
// Record a supply chain event on Cardano
const txHash = await cardanoMetadataService.submitMetadataTransaction({
  eventType: "quality_check",
  timestamp: new Date().toISOString(),
  location: "Processing Facility B",
  details: {
    inspector: "John Doe",
    grade: "A",
    notes: "Passed all quality standards",
  },
});
```

**Token Verification**:

```typescript
// Verify token authenticity
const tokenInfo = await cardanoTokenService.getTokenInfo(policyId, assetName);
// Returns: minting history, current holders, transaction history
```

For detailed setup instructions, see [CARDANO_SETUP.md](CARDANO_SETUP.md).

### Multi-Chain Architecture

Switch between Hedera and Cardano seamlessly:

```typescript
// Set active blockchain
blockchainAbstraction.setActiveBlockchain("cardano");

// All operations now use Cardano
await blockchainAbstraction.createToken(params);
await blockchainAbstraction.recordEvent(event);
```

The abstraction layer provides a unified interface while leveraging blockchain-specific features.

## 🚀 Deployment

### Vercel (Frontend)

```bash
make deploy-vercel
```

### Production Docker

```bash
make prod
```

### Production Checklist

Before deploying to production:

- [ ] Switch to mainnet for both blockchains
- [ ] Update Blockfrost to mainnet project ID
- [ ] Secure all environment variables
- [ ] Test thoroughly on testnets
- [ ] Review transaction fees and costs
- [ ] Set up monitoring and alerts
- [ ] Backup database regularly

## ✨ Key Features

### Multi-Chain Blockchain Integration

- **🔗 Supply Chain Tracking**: Immutable harvest records via Hedera Consensus Service or Cardano transaction metadata
- **🪙 Crop Tokenization**:
  - Hedera Token Service (HTS) for fungible/non-fungible tokens
  - Cardano Native Tokens for asset representation without smart contracts
- **📜 Smart Contracts**:
  - Hedera smart contracts for automated agreements
  - Cardano Plutus contracts for DeFi loan collateralization
- **📊 Real-time Analytics**: Live data from Hedera mirror nodes and Blockfrost API
- **🔐 Multi-Wallet Support**:
  - Hedera: HashPack wallet integration
  - Cardano: Lace, Nami, Eternl, and Flint wallet support
- **🔄 Blockchain Abstraction**: Seamlessly switch between Hedera and Cardano
- **🐳 Docker-First**: Complete containerized development environment
- **☁️ Vercel-Ready**: One-command deployment to production

### Cardano-Specific Features

- **Native Token Minting**: Create crop tokens without smart contracts
- **Transaction Metadata**: Attach supply chain events to transactions (CIP-20)
- **Token Verification**: Query token history and authenticity via Blockfrost
- **UTxO Model**: Leverage Cardano's unique transaction architecture
- **Plutus Integration**: Advanced smart contract capabilities for DeFi

## 🏗️ Project Structure

```
HarvestLedger/
├── frontend/              # Next.js 16 + React 19 + Apollo Client + MeshJS
│   ├── lib/
│   │   ├── cardano-wallet-connector.ts    # Cardano wallet integration
│   │   ├── cardano-token-service.ts       # Token minting & transfers
│   │   ├── cardano-metadata-service.ts    # Supply chain metadata
│   │   └── blockchain-abstraction.ts      # Multi-chain interface
│   └── components/
│       └── cardano/                       # Cardano UI components
├── backend/               # FastAPI + GraphQL + PostgreSQL + PyCardano
│   ├── app/
│   │   ├── core/
│   │   │   ├── cardano_client.py         # Blockfrost integration
│   │   │   └── hedera.py                 # Hedera integration
│   │   ├── models/
│   │   │   └── cardano.py                # Cardano database models
│   │   └── graphql/
│   │       └── cardano_resolvers.py      # Cardano GraphQL API
├── docker-compose.yml     # Development environment
├── Makefile              # All commands in one place
├── .env                  # Unified configuration
├── CARDANO_SETUP.md      # Cardano setup guide
└── HEDERA_SETUP.md       # Hedera setup guide
```

## 🔧 Troubleshooting

### Common Issues

**Port conflicts?**

```bash
make clean && make dev
```

**Services not starting?**

```bash
make verify  # Check configuration
make health  # Check service health
```

**Need fresh start?**

```bash
make clean && make build && make dev
```

### Getting Help

```bash
make help    # Show all available commands
make status  # Check what's running
make logs    # See what's happening
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make dev`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the agricultural community**
