# HarvestLedger - Agriculture Supply Chain & Financing Platform

A modern web application for agriculture supply chain tracking and financing, built with FastAPI, React/Next.js, and integrated with Hedera blockchain for transparency and tokenization.

## Architecture Overview

- **Backend**: FastAPI + GraphQL (Strawberry) + PostgreSQL + Hedera SDK
- **Frontend**: Next.js + React + Apollo Client + Tailwind CSS + HashPack
- **Blockchain**: Hedera Testnet (HCS for logging, HTS for tokenization, Smart Contracts for loans)
- **Infrastructure**: Docker + Docker Compose

## Prerequisites

1. **Hedera Testnet Account**: Create a free account at [portal.hedera.com](https://portal.hedera.com)
2. **Docker & Docker Compose**: Latest versions installed
3. **Node.js 20+** (for local development)
4. **Python 3.12+** (for local development)

### 🔑 Getting Hedera Credentials

1. **Visit**: [portal.hedera.com](https://portal.hedera.com)
2. **Create Account**: Sign up for free
3. **Get Testnet Access**: Navigate to "Testnet Access"
4. **Generate Credentials**: Create testnet account
5. **Copy**: Account ID (0.0.XXXXXX) and Private Key

See [HEDERA_SETUP.md](HEDERA_SETUP.md) for detailed instructions.

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
git clone <repository>
cd harvest-ledger

# Complete automated setup
python3 scripts/setup.py

# Create Hedera resources (topics & contracts)
python3 scripts/setup_hedera.py

# Start the application
./scripts/start.sh
```

### Option 2: Manual Setup
```bash
git clone <repository>
cd harvest-ledger

# 1. Setup environment
cp .env.example .env
# Edit .env with your Hedera testnet credentials

# 2. Create Hedera resources
python3 scripts/create_topic.py      # Creates HCS topic
python3 scripts/deploy_contract.py   # Deploys smart contract

# 3. Start application
docker-compose up --build
```

### Option 3: Development Mode (Mock Blockchain)
```bash
git clone <repository>
cd harvest-ledger

# Start without real Hedera credentials (uses mocks)
./scripts/build.sh
./scripts/start.sh
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql
- **API Documentation**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@harvest.com / admin123)
- **MailHog UI**: http://localhost:8025 (Email testing)

## Environment Variables

Create a `.env` file with your Hedera testnet credentials:

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here
HEDERA_RPC_URL=https://testnet.hashio.io/api

# Database
DATABASE_URL=postgresql://harvest_user:harvest_pass@db:5432/harvest_ledger

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256

# API
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

## Development

### Docker Development (Recommended)
```bash
# Start all services (includes MailHog & pgAdmin)
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Stop services
./scripts/docker-dev.sh down

# Restart services
./scripts/docker-dev.sh restart
```

### Local Development
#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Development Tools
- **pgAdmin**: Database management at http://localhost:5050
  - Email: admin@harvest.com
  - Password: admin123
- **MailHog**: Email testing at http://localhost:8025
  - SMTP: localhost:1025 (for backend email sending)

## Production Deployment

### Full Stack Deployment (Docker)
Use the production docker-compose configuration:
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Frontend-Only Deployment (Netlify)
For deploying just the frontend to Netlify while using a separate backend:

```bash
# Test the build locally
./scripts/build-netlify.sh

# Deploy to Netlify
# 1. Push to GitHub
# 2. Connect repository to Netlify
# 3. Configure build settings (see NETLIFY_DEPLOYMENT.md)
```

**📖 See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for complete Netlify setup guide**

## Key Features

- **Supply Chain Tracking**: Immutable harvest records via Hedera Consensus Service
- **Crop Tokenization**: HTS tokens representing crop yields for trading/financing
- **Smart Contracts**: Automated loan agreements with conditional payments
- **Real-time Analytics**: Live data from Hedera mirror nodes
- **Wallet Integration**: HashPack for secure blockchain interactions

## API Documentation

- GraphQL Schema: Available at `/graphql` endpoint
- REST API: Available at `/docs` (FastAPI auto-generated)

## Security Features

- JWT-based authentication
- Environment-based secret management
- CORS configuration
- Docker security best practices
- Hedera testnet integration (zero-cost transactions)