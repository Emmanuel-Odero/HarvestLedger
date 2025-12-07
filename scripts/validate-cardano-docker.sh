#!/bin/bash

# Validate Cardano integration readiness in Docker environment
# This script checks if the Docker setup is ready for Cardano integration

set -e

# Colors for output
BLUE='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

echo -e "${BLUE}======================================================================${RESET}"
echo -e "${BLUE}🔍 Validating Cardano Integration Readiness${RESET}"
echo -e "${BLUE}======================================================================${RESET}"

# Check if Docker is running
echo -e "\n${YELLOW}1️⃣  Checking Docker status...${RESET}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${RESET}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${RESET}"

# Check if services are running
echo -e "\n${YELLOW}2️⃣  Checking service status...${RESET}"
if ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Services are not running${RESET}"
    echo -e "${YELLOW}   Run 'make dev' to start services${RESET}"
else
    echo -e "${GREEN}✅ Services are running${RESET}"
fi

# Check Dockerfile includes Cardano dependencies
echo -e "\n${YELLOW}3️⃣  Checking Dockerfile configuration...${RESET}"
if grep -q "pycardano" backend/requirements.txt; then
    echo -e "${GREEN}✅ Backend requirements include PyCardano${RESET}"
else
    echo -e "${RED}❌ PyCardano not in backend requirements${RESET}"
    exit 1
fi

if grep -q "blockfrost-python" backend/requirements.txt; then
    echo -e "${GREEN}✅ Backend requirements include Blockfrost${RESET}"
else
    echo -e "${RED}❌ Blockfrost not in backend requirements${RESET}"
    exit 1
fi

# Check frontend package.json
echo -e "\n${YELLOW}4️⃣  Checking frontend dependencies...${RESET}"
if grep -q "@meshsdk/core" frontend/package.json; then
    echo -e "${GREEN}✅ Frontend includes @meshsdk/core${RESET}"
else
    echo -e "${RED}❌ @meshsdk/core not in frontend package.json${RESET}"
    exit 1
fi

if grep -q "@meshsdk/react" frontend/package.json; then
    echo -e "${GREEN}✅ Frontend includes @meshsdk/react${RESET}"
else
    echo -e "${RED}❌ @meshsdk/react not in frontend package.json${RESET}"
    exit 1
fi

# Check environment file
echo -e "\n${YELLOW}5️⃣  Checking environment configuration...${RESET}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${RESET}"
    if grep -q "BLOCKFROST_PROJECT_ID" .env; then
        echo -e "${GREEN}✅ BLOCKFROST_PROJECT_ID configured${RESET}"
    else
        echo -e "${YELLOW}⚠️  BLOCKFROST_PROJECT_ID not set (optional for development)${RESET}"
    fi
    if grep -q "CARDANO_NETWORK" .env; then
        echo -e "${GREEN}✅ CARDANO_NETWORK configured${RESET}"
    else
        echo -e "${YELLOW}⚠️  CARDANO_NETWORK not set (will use default)${RESET}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${RESET}"
fi

# Check if Cardano files exist
echo -e "\n${YELLOW}6️⃣  Checking Cardano implementation files...${RESET}"
REQUIRED_FILES=(
    "backend/app/core/cardano_client.py"
    "backend/app/models/cardano.py"
    "backend/app/graphql/cardano_resolvers.py"
    "frontend/lib/cardano-wallet-connector.ts"
    "frontend/lib/cardano-token-service.ts"
    "frontend/lib/cardano-metadata-service.ts"
    "frontend/lib/blockchain-abstraction.ts"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${RESET}"
    else
        echo -e "${RED}❌ $file not found${RESET}"
        ALL_FILES_EXIST=false
    fi
done

# Check test files
echo -e "\n${YELLOW}7️⃣  Checking test files...${RESET}"
TEST_FILES=(
    "backend/tests/test_integration_cardano.py"
    "backend/tests/run_integration_test.py"
    "frontend/lib/__tests__/integration-cardano.test.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${RESET}"
    else
        echo -e "${RED}❌ $file not found${RESET}"
        ALL_FILES_EXIST=false
    fi
done

# Check documentation
echo -e "\n${YELLOW}8️⃣  Checking documentation...${RESET}"
DOC_FILES=(
    "CARDANO_SETUP.md"
    "CARDANO_TESTING.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${RESET}"
    else
        echo -e "${YELLOW}⚠️  $file not found${RESET}"
    fi
done

# Summary
echo -e "\n${BLUE}======================================================================${RESET}"
if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✅ Cardano integration is ready!${RESET}"
    echo -e "${BLUE}======================================================================${RESET}"
    echo -e "\n${BLUE}📋 Next Steps:${RESET}"
    echo -e "   1. Rebuild Docker images: ${YELLOW}docker compose build${RESET}"
    echo -e "   2. Start services: ${YELLOW}make dev${RESET}"
    echo -e "   3. Run tests: ${YELLOW}make cardano-test${RESET}"
    echo -e "   4. Test in Docker: ${YELLOW}bash scripts/test-cardano-docker.sh${RESET}"
    echo -e "\n${BLUE}📖 Documentation:${RESET}"
    echo -e "   - Setup Guide: ${YELLOW}CARDANO_SETUP.md${RESET}"
    echo -e "   - Testing Guide: ${YELLOW}CARDANO_TESTING.md${RESET}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some required files are missing${RESET}"
    echo -e "${BLUE}======================================================================${RESET}"
    exit 1
fi
