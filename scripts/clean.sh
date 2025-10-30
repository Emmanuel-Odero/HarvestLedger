#!/bin/bash

# HarvestLedger Clean Script

set -e

echo "🧹 Cleaning HarvestLedger Application..."

# Stop containers
docker-compose down

# Remove volumes (this will delete all data!)
echo "⚠️  This will delete all database data. Are you sure? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup completed!"
else
    echo "❌ Cleanup cancelled."
fi