#!/bin/bash

# HarvestLedger Build Script

set -e

echo "🌾 Building HarvestLedger Application..."

# Check if Python setup script exists and run it
if [ -f "scripts/setup.py" ]; then
    echo "🐍 Running Python setup script..."
    python3 scripts/setup.py
else
    echo "⚠️  Python setup script not found, running basic build..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi

    # Check if .env file exists
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found. Copying from .env.example..."
        cp .env.example .env
        echo "📝 Please edit .env file with your Hedera testnet credentials before running the application."
    fi

    # Build images
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache

    echo "✅ Build completed successfully!"
fi

echo ""
echo "Next steps:"
echo "1. Edit .env file with your Hedera testnet credentials (optional for mock mode)"
echo "2. Run: ./scripts/start.sh"