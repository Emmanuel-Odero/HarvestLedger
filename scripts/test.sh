#!/bin/bash

# HarvestLedger Test Script

set -e

echo "🧪 Testing HarvestLedger Application..."

# Test GraphQL endpoint
echo "📡 Testing GraphQL endpoint..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __schema { types { name } } }"}' \
  http://localhost:8000/graphql

echo ""
echo "🔍 Testing REST API health endpoint..."
curl -f http://localhost:8000/health | jq .

echo ""
echo "🌐 Testing frontend..."
curl -f http://localhost:3000 > /dev/null && echo "✅ Frontend is accessible"

echo ""
echo "✅ Basic tests completed!"
echo ""
echo "🔗 Test Hedera integration:"
echo "1. Create a user account via the frontend"
echo "2. Record a harvest to test HCS integration"
echo "3. Tokenize a harvest to test HTS integration"
echo "4. Check transactions in the dashboard"