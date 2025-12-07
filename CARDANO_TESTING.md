# Cardano Integration Testing Guide

This document provides comprehensive testing instructions for the Cardano blockchain integration in HarvestLedger.

## Table of Contents

- [Quick Start](#quick-start)
- [Integration Tests](#integration-tests)
- [Docker Testing](#docker-testing)
- [Manual Testing](#manual-testing)
- [Test Coverage](#test-coverage)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Run All Cardano Tests

```bash
make cardano-test
```

This command runs:

- Backend integration tests (Python)
- Frontend integration tests (Jest)

### Test in Docker Environment

```bash
make cardano-docker-test
```

This command:

- Builds Docker images
- Starts all services
- Verifies Cardano dependencies
- Runs integration tests in containers
- Validates API endpoints

## Integration Tests

### Backend Integration Tests

**Location**: `backend/tests/test_integration_cardano.py`

**Run standalone**:

```bash
python backend/tests/run_integration_test.py
```

**Tests covered**:

1. ✅ Wallet connection flow
2. ✅ Token minting flow
3. ✅ Token transfer flow
4. ✅ Supply chain metadata flow
5. ✅ Multi-chain switching
6. ✅ Database persistence
7. ✅ End-to-end flow

**Expected output**:

```
======================================================================
🧪 Cardano Integration Tests
======================================================================

🔗 Testing wallet connection flow...
   ✅ Wallet connection flow validated

🪙 Testing token minting flow...
   ✅ Token minting flow validated

...

======================================================================
📊 Test Results: 7 passed, 0 failed
======================================================================

✅ All integration tests passed!
```

### Frontend Integration Tests

**Location**: `frontend/lib/__tests__/integration-cardano.test.ts`

**Run tests**:

```bash
cd frontend
npm test -- lib/__tests__/integration-cardano.test.ts
```

**Tests covered**:

1. ✅ Wallet connection flow
2. ✅ Wallet balance retrieval
3. ✅ Token minting validation
4. ✅ Token transfer validation
5. ✅ Transaction fee calculation
6. ✅ Supply chain metadata construction
7. ✅ Multi-chain switching
8. ✅ Data format normalization
9. ✅ End-to-end flow
10. ✅ Error handling

**Expected output**:

```
 PASS  lib/__tests__/integration-cardano.test.ts
  Cardano Integration Tests
    Wallet Connection Flow
      ✓ should complete wallet connection flow
      ✓ should retrieve wallet balance and assets
    Token Minting Flow
      ✓ should validate and mint crop token
    ...

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

## Docker Testing

### Full Docker Environment Test

The Docker test script validates the complete containerized environment:

```bash
bash scripts/test-cardano-docker.sh
```

**Test steps**:

1. ✅ Check Docker status
2. ✅ Build Docker images
3. ✅ Start services
4. ✅ Wait for services to be ready
5. ✅ Verify environment variables
6. ✅ Test backend Cardano dependencies
7. ✅ Test backend Cardano client
8. ✅ Test frontend MeshJS dependencies
9. ✅ Run integration tests in containers
10. ✅ Test GraphQL API endpoints
11. ✅ Test Cardano UI components
12. ✅ Check database schema
13. ✅ Display service status

### Individual Service Tests

**Test backend in Docker**:

```bash
docker compose exec backend python tests/run_integration_test.py
```

**Test frontend in Docker**:

```bash
docker compose exec frontend npm test -- lib/__tests__/integration-cardano.test.ts
```

**Check Cardano dependencies in backend**:

```bash
docker compose exec backend python -c "import pycardano; print(pycardano.__version__)"
docker compose exec backend python -c "import blockfrost; print('Blockfrost installed')"
```

**Check Cardano dependencies in frontend**:

```bash
docker compose exec frontend npm list @meshsdk/core
docker compose exec frontend npm list @meshsdk/react
```

## Manual Testing

### Prerequisites

1. **Cardano Wallet**: Install a supported wallet (Nami, Eternl, Flint, or Lace)
2. **Testnet ADA**: Get testnet ADA from [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
3. **Blockfrost API Key**: Get a free API key from [Blockfrost.io](https://blockfrost.io)

### Manual Test Scenarios

#### 1. Wallet Connection

1. Navigate to `http://localhost:3000/dashboard/cardano-integration`
2. Click "Connect Wallet"
3. Select your wallet (e.g., Nami)
4. Approve the connection in your wallet
5. Verify wallet address and balance are displayed

**Expected result**: Wallet connects successfully, address and ADA balance shown

#### 2. Token Minting

1. Ensure wallet is connected
2. Fill in crop tokenization form:
   - Crop Type: Coffee
   - Quantity: 1000
   - Harvest Date: Select date
   - Location: Sidamo, Ethiopia
3. Click "Mint Token"
4. Sign the transaction in your wallet
5. Wait for confirmation

**Expected result**: Token minted successfully, transaction hash displayed

#### 3. Token Transfer

1. Ensure you have minted tokens
2. Navigate to token transfer section
3. Enter recipient address
4. Select token to transfer
5. Enter quantity
6. Review transaction fee
7. Click "Transfer"
8. Sign the transaction in your wallet

**Expected result**: Token transferred successfully, both wallets updated

#### 4. Supply Chain Event Recording

1. Navigate to supply chain section
2. Select event type (Harvest, Processing, etc.)
3. Fill in event details
4. Click "Record Event"
5. Sign the transaction

**Expected result**: Event recorded on-chain with metadata

#### 5. Multi-Chain Switching

1. Connect to Hedera (if available)
2. Perform a transaction
3. Switch to Cardano
4. Perform a transaction
5. Verify both blockchains work independently

**Expected result**: Seamless switching between blockchains

## Test Coverage

### Backend Coverage

- **Wallet Management**: Connection, disconnection, balance retrieval
- **Token Operations**: Minting, transfer, balance validation
- **Metadata**: Construction, submission, retrieval, decoding
- **Database**: Persistence, relationships, queries
- **Error Handling**: Wallet errors, transaction errors, API errors

### Frontend Coverage

- **Wallet Connector**: Detection, connection, balance retrieval
- **Token Service**: Minting, transfer, validation
- **Metadata Service**: Event construction, submission
- **Blockchain Abstraction**: Multi-chain routing, data normalization
- **UI Components**: Wallet display, token forms, transaction history
- **Error Handling**: User-friendly error messages

### Property-Based Tests

The following property-based tests validate correctness properties:

1. **Property 15**: Metadata round-trip consistency

   - Location: `backend/tests/test_cardano_metadata_roundtrip.py`
   - Validates: Requirements 3.5

2. **Property 50**: Error logging completeness
   - Location: `backend/tests/test_error_logging.py`
   - Validates: Requirements 12.2

## Troubleshooting

### Common Issues

#### Backend Tests Fail with Import Errors

**Problem**: `ImportError: cannot import name 'ContractName' from 'eth_typing'`

**Solution**: Use the standalone test runner instead of pytest:

```bash
python backend/tests/run_integration_test.py
```

#### Docker Services Don't Start

**Problem**: Services fail to start or timeout

**Solution**:

1. Check Docker is running: `docker info`
2. Check logs: `docker compose logs backend`
3. Rebuild images: `docker compose build --no-cache`
4. Restart services: `docker compose down && docker compose up -d`

#### Wallet Connection Fails

**Problem**: Wallet doesn't connect in browser

**Solution**:

1. Ensure wallet extension is installed
2. Check you're on the correct network (Preprod testnet)
3. Refresh the page
4. Try a different wallet

#### Transaction Fails with Insufficient Funds

**Problem**: "Insufficient ADA for transaction fees"

**Solution**:

1. Get testnet ADA from faucet
2. Ensure you have at least 2 ADA for fees
3. Wait for previous transactions to confirm

#### Blockfrost API Errors

**Problem**: API calls fail with authentication errors

**Solution**:

1. Verify `BLOCKFROST_PROJECT_ID` is set in `.env`
2. Check API key is valid at [Blockfrost.io](https://blockfrost.io)
3. Ensure you're using the correct network (preprod/mainnet)

### Debug Mode

Enable debug logging:

**Backend**:

```bash
export LOG_LEVEL=DEBUG
docker compose up backend
```

**Frontend**:

```bash
export NEXT_PUBLIC_DEBUG=true
docker compose up frontend
```

### Test Data Cleanup

Reset test data:

```bash
# Stop services
docker compose down

# Remove volumes (WARNING: deletes all data)
docker compose down -v

# Restart fresh
docker compose up -d
```

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Cardano Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Cardano tests
        run: make cardano-test
      - name: Test Docker environment
        run: make cardano-docker-test
```

## Performance Benchmarks

Expected test execution times:

- Backend integration tests: ~2 seconds
- Frontend integration tests: ~1 second
- Docker environment test: ~60 seconds (includes startup)
- Full test suite: ~65 seconds

## Next Steps

After successful testing:

1. ✅ Review test results
2. ✅ Check code coverage
3. ✅ Perform manual testing
4. ✅ Test on testnet with real wallets
5. ✅ Security audit
6. ✅ Performance optimization
7. ✅ Production deployment

## Resources

- [Cardano Documentation](https://docs.cardano.org/)
- [MeshJS Documentation](https://meshjs.dev/)
- [Blockfrost API Documentation](https://docs.blockfrost.io/)
- [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
- [HarvestLedger Setup Guide](./CARDANO_SETUP.md)
