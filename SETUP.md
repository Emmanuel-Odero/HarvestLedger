# HarvestLedger Setup Guide

## Prerequisites

### 1. System Requirements
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)
- Git

### 2. Hedera Testnet Account
1. Visit [Hedera Portal](https://portal.hedera.com)
2. Create a free testnet account
3. Note your Account ID (format: 0.0.XXXXXX)
4. Generate and save your private key

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd harvest-ledger
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your Hedera credentials:
```env
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here
```

### 3. Build and Start
```bash
./scripts/build.sh
./scripts/start.sh
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- GraphQL Playground: http://localhost:8000/graphql
- API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://harvest_user:harvest_pass@localhost:5432/harvest_ledger"
export OPERATOR_ID="0.0.YOUR_ACCOUNT_ID"
export OPERATOR_KEY="your_private_key_here"

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# Start only the database
docker-compose up -d db

# Run migrations (if using Alembic)
cd backend
alembic upgrade head
```

## Testing

### Run Tests
```bash
./scripts/test.sh
```

### Manual Testing
1. **Register User**: Create account via frontend
2. **Record Harvest**: Test HCS integration
3. **Tokenize Harvest**: Test HTS integration
4. **Create Loan**: Test smart contract integration
5. **View Analytics**: Check dashboard functionality

## Production Deployment

### Using Docker Compose
```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build -d

# With Nginx reverse proxy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```env
# Security
JWT_SECRET=your_strong_jwt_secret_here
DB_PASSWORD=your_strong_db_password_here

# Hedera Mainnet (when ready)
HEDERA_NETWORK=mainnet
OPERATOR_ID=0.0.YOUR_MAINNET_ACCOUNT
OPERATOR_KEY=your_mainnet_private_key

# URLs
BACKEND_URL=https://api.yourapp.com
FRONTEND_URL=https://yourapp.com
```

## Troubleshooting

### Common Issues

1. **Hedera Connection Failed**
   - Verify OPERATOR_ID and OPERATOR_KEY in .env
   - Check network connectivity
   - Ensure testnet account has sufficient HBAR

2. **Database Connection Error**
   - Ensure PostgreSQL container is running
   - Check DATABASE_URL format
   - Verify database credentials

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf frontend/node_modules`
   - Reinstall dependencies: `cd frontend && npm install`
   - Check Node.js version compatibility

4. **GraphQL Schema Errors**
   - Restart backend service
   - Check backend logs: `docker-compose logs backend`
   - Verify database migrations

### Logs and Debugging
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Check service health
curl http://localhost:8000/health
```

## Architecture Overview

### Backend Stack
- **FastAPI**: REST API framework
- **Strawberry GraphQL**: GraphQL implementation
- **SQLAlchemy**: ORM for PostgreSQL
- **Hiero SDK**: Hedera blockchain integration
- **JWT**: Authentication

### Frontend Stack
- **Next.js 14**: React framework with SSR
- **Apollo Client**: GraphQL client
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Shadcn/UI**: Component library

### Blockchain Integration
- **HCS (Hedera Consensus Service)**: Immutable event logging
- **HTS (Hedera Token Service)**: Crop tokenization
- **Smart Contracts**: Automated loan agreements
- **Mirror Node**: Real-time data queries

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **JWT Tokens**: Use strong secrets and appropriate expiration
3. **Database**: Use strong passwords and connection encryption
4. **CORS**: Configure appropriate origins for production
5. **Rate Limiting**: Implemented via Nginx in production
6. **Input Validation**: All inputs validated on backend

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support

- Documentation: Check README.md and inline code comments
- Issues: Create GitHub issue with detailed description
- Community: Join our Discord/Telegram for discussions