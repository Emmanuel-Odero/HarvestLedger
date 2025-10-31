# HarvestLedger 🌾

**Blockchain-powered Agricultural Supply Chain Management**

A modern web application for agriculture supply chain tracking and financing, built with FastAPI, Next.js, and integrated with Hedera blockchain for transparency and tokenization.

## 🏗️ Architecture

- **Backend**: FastAPI + GraphQL (Strawberry) + PostgreSQL + Hedera SDK
- **Frontend**: Next.js 16 + React 19 + Apollo Client + Tailwind CSS
- **Blockchain**: Hedera Testnet (HCS for logging, HTS for tokenization)
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

## 🚀 Deployment

### Vercel (Frontend)
```bash
make deploy-vercel
```

### Production Docker
```bash
make prod
```

## ✨ Key Features

- **🔗 Supply Chain Tracking**: Immutable harvest records via Hedera Consensus Service
- **🪙 Crop Tokenization**: HTS tokens representing crop yields for trading/financing
- **📜 Smart Contracts**: Automated loan agreements with conditional payments
- **📊 Real-time Analytics**: Live data from Hedera mirror nodes
- **🔐 Wallet Integration**: HashPack for secure blockchain interactions
- **🐳 Docker-First**: Complete containerized development environment
- **☁️ Vercel-Ready**: One-command deployment to production

## 🏗️ Project Structure

```
HarvestLedger/
├── frontend/          # Next.js 16 + React 19 + Apollo Client
├── backend/           # FastAPI + GraphQL + PostgreSQL
├── docker-compose.yml # Development environment
├── Makefile          # All commands in one place
└── .env              # Unified configuration
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
