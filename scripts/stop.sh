#!/bin/bash

# HarvestLedger Stop Script

set -e

echo "🛑 Stopping HarvestLedger Application..."

# Stop and remove containers
docker-compose down

echo "✅ HarvestLedger stopped successfully!"
echo ""
echo "💡 To start again, run: ./scripts/start.sh"
echo "🗑️  To remove all data, run: ./scripts/clean.sh"