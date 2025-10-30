#!/bin/bash

# HarvestLedger Start Script

set -e

echo "🌾 Starting HarvestLedger Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./scripts/build.sh first."
    exit 1
fi

# Check for required environment variables
if ! grep -q "OPERATOR_ID=0.0." .env || ! grep -q "OPERATOR_KEY=" .env; then
    echo "⚠️  Please configure your Hedera testnet credentials in .env file:"
    echo "   - OPERATOR_ID (your Hedera testnet account ID)"
    echo "   - OPERATOR_KEY (your Hedera testnet private key)"
    echo ""
    echo "Get free testnet credentials at: https://portal.hedera.com"
    exit 1
fi

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check database
if docker-compose exec -T db pg_isready -U harvest_user -d harvest_ledger > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
fi

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready"
else
    echo "⚠️  Backend is starting up..."
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "⚠️  Frontend is starting up..."
fi

echo ""
echo "🎉 HarvestLedger is starting up!"
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   GraphQL:   http://localhost:8000/graphql"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 Monitor logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop the application:"
echo "   docker-compose down"