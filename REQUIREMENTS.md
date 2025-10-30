# HarvestLedger Requirements

## System Requirements

### Operating System
- Linux (Ubuntu 20.04+ recommended)
- macOS 10.15+
- Windows 10+ with WSL2

### Required Software
- **Docker 20.10+** - Container runtime
- **Docker Compose 2.0+** - Multi-container orchestration
- **Python 3.8+** - Backend development (3.12 recommended)
- **Node.js 18+** - Frontend development (20 recommended)
- **Git** - Version control

## Python Dependencies (Backend)

### Core Framework
```
fastapi==0.104.1              # Modern web framework
uvicorn[standard]==0.24.0     # ASGI server
strawberry-graphql[fastapi]==0.215.1  # GraphQL implementation
```

### Database & ORM
```
sqlalchemy==2.0.23            # SQL toolkit and ORM
psycopg2-binary==2.9.9        # PostgreSQL adapter
alembic==1.12.1               # Database migrations
```

### Authentication & Security
```
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4         # Password hashing
bcrypt==4.1.2                  # Bcrypt implementation
cryptography==41.0.7           # Cryptographic recipes
```

### Blockchain Integration
```
web3==6.11.3                  # Ethereum/EVM compatibility
# hedera-sdk-py                # Hedera SDK (when available)
```

### Data Processing
```
pandas==2.1.3                 # Data analysis
numpy==1.25.2                 # Numerical computing
pydantic==2.5.0               # Data validation
pydantic-settings==2.1.0      # Settings management
```

### HTTP & Networking
```
httpx==0.25.2                 # Async HTTP client
requests==2.31.0              # HTTP library
aiohttp==3.9.1                # Async HTTP client/server
```

### Utilities
```
python-dotenv==1.0.0          # Environment variables
python-multipart==0.0.6       # File uploads
email-validator==2.1.0        # Email validation
python-dateutil==2.8.2        # Date utilities
pytz==2023.3                  # Timezone handling
```

## Node.js Dependencies (Frontend)

### Core Framework
```json
{
  "next": "14.0.3",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### GraphQL & State Management
```json
{
  "@apollo/client": "^3.8.7",
  "graphql": "^16.8.1",
  "zustand": "^4.4.7"
}
```

### Blockchain Integration
```json
{
  "@hashgraph/sdk": "^2.40.0",
  "@hashpack/hashconnect": "^1.5.1"
}
```

### UI Components & Styling
```json
{
  "tailwindcss": "^3.3.5",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "lucide-react": "^0.294.0",
  "class-variance-authority": "^0.7.0"
}
```

### Charts & Visualization
```json
{
  "recharts": "^2.8.0"
}
```

### Form Handling
```json
{
  "react-hook-form": "^7.48.2",
  "@hookform/resolvers": "^3.3.2",
  "zod": "^3.22.4"
}
```

## Installation Methods

### Method 1: Automated Setup (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd harvest-ledger

# Run automated setup
python3 scripts/setup.py

# Or use the build script
./scripts/build.sh
```

### Method 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# If full requirements fail, use minimal
pip install -r requirements-minimal.txt
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Or use yarn
yarn install
```

### Method 3: Docker Only
```bash
# Build and start with Docker
docker-compose up --build
```

## Development Dependencies

### Python Development Tools
```
pytest==7.4.3                 # Testing framework
black==23.11.0                # Code formatter
isort==5.12.0                 # Import sorter
flake8==6.1.0                 # Linter
mypy==1.7.1                   # Type checker
```

### Node.js Development Tools
```json
{
  "typescript": "^5.3.2",
  "@types/node": "^20.9.0",
  "@types/react": "^18.2.37",
  "eslint": "^8.54.0",
  "eslint-config-next": "14.0.3"
}
```

## Optional Dependencies

### Hedera SDK
The application includes a mock implementation for development. For production:
```bash
# When available, install official Hedera SDK
pip install hiero-sdk-python

# Or community alternatives
pip install hedera-sdk-py
```

### Performance & Monitoring
```
gunicorn==21.2.0              # Production WSGI server
structlog==23.2.0             # Structured logging
orjson==3.9.10                # Fast JSON serialization
```

### Testing & Quality Assurance
```
pytest-asyncio==0.21.1        # Async testing
pytest-cov==4.1.0             # Coverage reporting
factory-boy==3.3.0            # Test data generation
locust==2.17.0                # Load testing
```

## Environment Variables

### Required for Production
```env
# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
JWT_SECRET=your_strong_secret_here
```

### Optional Configuration
```env
# API URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Hedera Resources
HCS_TOPIC_ID=0.0.123456
LOAN_CONTRACT_ID=0.0.789012

# Mirror Node
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
```

## Troubleshooting

### Common Issues

1. **Hedera SDK Installation Fails**
   - Use mock implementation for development
   - Check Python version compatibility
   - Install build tools: `apt-get install build-essential`

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check connection string format
   - Verify credentials and permissions

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules`
   - Update Node.js to latest LTS
   - Check for conflicting global packages

4. **Docker Build Failures**
   - Increase Docker memory allocation
   - Clear Docker cache: `docker system prune`
   - Check disk space availability

### Getting Help

- Check logs: `docker-compose logs -f`
- Validate configuration: `docker-compose config`
- Test connectivity: `curl http://localhost:8000/health`
- Review documentation in `SETUP.md`

## Minimum System Resources

- **RAM**: 4GB (8GB recommended)
- **Storage**: 10GB free space
- **CPU**: 2 cores (4 cores recommended)
- **Network**: Stable internet for blockchain operations