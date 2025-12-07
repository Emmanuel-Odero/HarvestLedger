#!/bin/bash

# Test Cardano integration in Docker environment
# This script validates that all Cardano services work correctly in containers

set -e

# Colors for output
BLUE='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

echo -e "${BLUE}======================================================================${RESET}"
echo -e "${BLUE}🐳 Testing Cardano Integration in Docker Environment${RESET}"
echo -e "${BLUE}======================================================================${RESET}"

# Step 1: Check if Docker is running
echo -e "\n${YELLOW}1️⃣  Checking Docker status...${RESET}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${RESET}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${RESET}"

# Step 2: Build Docker images
echo -e "\n${YELLOW}2️⃣  Building Docker images...${RESET}"
docker compose build --quiet
echo -e "${GREEN}✅ Docker images built successfully${RESET}"

# Step 3: Start services
echo -e "\n${YELLOW}3️⃣  Starting Docker services...${RESET}"
docker compose up -d
echo -e "${GREEN}✅ Services started${RESET}"

# Step 4: Wait for services to be ready
echo -e "\n${YELLOW}4️⃣  Waiting for services to be ready...${RESET}"
echo -e "   Waiting for database..."
sleep 5

# Wait for backend to be ready
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${RESET}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Backend failed to start${RESET}"
        docker compose logs backend
        exit 1
    fi
    echo -e "   Waiting for backend... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Wait for frontend to be ready
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready${RESET}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Frontend failed to start${RESET}"
        docker compose logs frontend
        exit 1
    fi
    echo -e "   Waiting for frontend... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Step 5: Verify environment variables
echo -e "\n${YELLOW}5️⃣  Verifying Cardano environment variables...${RESET}"
if docker compose exec -T backend env | grep -q "BLOCKFROST_PROJECT_ID"; then
    echo -e "${GREEN}✅ BLOCKFROST_PROJECT_ID is set${RESET}"
else
    echo -e "${YELLOW}⚠️  BLOCKFROST_PROJECT_ID not set (optional for development)${RESET}"
fi

if docker compose exec -T backend env | grep -q "CARDANO_NETWORK"; then
    echo -e "${GREEN}✅ CARDANO_NETWORK is set${RESET}"
else
    echo -e "${YELLOW}⚠️  CARDANO_NETWORK not set (will use default)${RESET}"
fi

# Step 6: Test backend Cardano dependencies
echo -e "\n${YELLOW}6️⃣  Testing backend Cardano dependencies...${RESET}"
if docker compose exec -T backend python -c "import pycardano; print('PyCardano version:', pycardano.__version__)" 2>/dev/null; then
    echo -e "${GREEN}✅ PyCardano is installed${RESET}"
else
    echo -e "${RED}❌ PyCardano is not installed${RESET}"
    exit 1
fi

if docker compose exec -T backend python -c "import blockfrost; print('Blockfrost-python installed')" 2>/dev/null; then
    echo -e "${GREEN}✅ Blockfrost-python is installed${RESET}"
else
    echo -e "${RED}❌ Blockfrost-python is not installed${RESET}"
    exit 1
fi

# Step 7: Test backend Cardano client initialization
echo -e "\n${YELLOW}7️⃣  Testing backend Cardano client...${RESET}"
TEST_SCRIPT='
from app.core.cardano_client import CardanoClient
import asyncio

async def test():
    try:
        client = CardanoClient()
        print("CardanoClient initialized successfully")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

result = asyncio.run(test())
exit(0 if result else 1)
'

if docker compose exec -T backend python -c "$TEST_SCRIPT" 2>/dev/null; then
    echo -e "${GREEN}✅ Backend Cardano client initialized${RESET}"
else
    echo -e "${YELLOW}⚠️  Backend Cardano client initialization failed (may need API key)${RESET}"
fi

# Step 8: Test frontend MeshJS dependencies
echo -e "\n${YELLOW}8️⃣  Testing frontend Cardano dependencies...${RESET}"
if docker compose exec -T frontend sh -c "npm list @meshsdk/core" 2>/dev/null | grep -q "@meshsdk/core"; then
    echo -e "${GREEN}✅ @meshsdk/core is installed${RESET}"
else
    echo -e "${RED}❌ @meshsdk/core is not installed${RESET}"
    exit 1
fi

if docker compose exec -T frontend sh -c "npm list @meshsdk/react" 2>/dev/null | grep -q "@meshsdk/react"; then
    echo -e "${GREEN}✅ @meshsdk/react is installed${RESET}"
else
    echo -e "${RED}❌ @meshsdk/react is not installed${RESET}"
    exit 1
fi

# Step 9: Run integration tests in containers
echo -e "\n${YELLOW}9️⃣  Running integration tests in containers...${RESET}"
echo -e "   Running backend integration tests..."
if docker compose exec -T backend python tests/run_integration_test.py 2>&1 | grep -q "All integration tests passed"; then
    echo -e "${GREEN}✅ Backend integration tests passed${RESET}"
else
    echo -e "${RED}❌ Backend integration tests failed${RESET}"
    docker compose exec -T backend python tests/run_integration_test.py
    exit 1
fi

# Step 10: Test GraphQL API endpoints
echo -e "\n${YELLOW}🔟 Testing GraphQL API...${RESET}"
GRAPHQL_QUERY='{"query":"{ __schema { types { name } } }"}'
if curl -s -X POST http://localhost:8000/graphql \
    -H "Content-Type: application/json" \
    -d "$GRAPHQL_QUERY" | grep -q "data"; then
    echo -e "${GREEN}✅ GraphQL API is responding${RESET}"
else
    echo -e "${RED}❌ GraphQL API is not responding${RESET}"
    exit 1
fi

# Step 11: Test Cardano UI components
echo -e "\n${YELLOW}1️⃣1️⃣  Testing Cardano UI components...${RESET}"
if curl -s http://localhost:3000/dashboard/cardano-integration | grep -q "html"; then
    echo -e "${GREEN}✅ Cardano integration page is accessible${RESET}"
else
    echo -e "${YELLOW}⚠️  Cardano integration page may not be accessible${RESET}"
fi

# Step 12: Check database migrations
echo -e "\n${YELLOW}1️⃣2️⃣  Checking database schema...${RESET}"
if docker compose exec -T db psql -U harvest_user -d harvest_ledger -c "\dt" 2>/dev/null | grep -q "cardano"; then
    echo -e "${GREEN}✅ Cardano database tables exist${RESET}"
else
    echo -e "${YELLOW}⚠️  Cardano database tables may not be created yet${RESET}"
fi

# Step 13: Display service status
echo -e "\n${YELLOW}1️⃣3️⃣  Service status:${RESET}"
docker compose ps

# Summary
echo -e "\n${BLUE}======================================================================${RESET}"
echo -e "${GREEN}✅ Docker environment testing completed successfully!${RESET}"
echo -e "${BLUE}======================================================================${RESET}"
echo -e "\n${BLUE}📊 Services:${RESET}"
echo -e "   🌐 Frontend:     http://localhost:3000"
echo -e "   🔧 Backend API:  http://localhost:8000"
echo -e "   📊 GraphQL:      http://localhost:8000/graphql"
echo -e "   🗄️  PgAdmin:      http://localhost:5050"
echo -e "\n${BLUE}🎯 Cardano Features:${RESET}"
echo -e "   📱 Wallet Connection:  http://localhost:3000/dashboard/cardano-integration"
echo -e "   🪙 Token Minting:      Available in dashboard"
echo -e "   💸 Token Transfer:     Available in dashboard"
echo -e "   📦 Supply Chain:       Metadata recording enabled"
echo -e "\n${YELLOW}💡 To stop services: docker compose down${RESET}"
echo -e "${YELLOW}💡 To view logs: docker compose logs -f${RESET}"
echo ""

exit 0
