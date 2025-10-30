#!/bin/bash

# Test script for Docker services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🧪 Testing HarvestLedger Docker Services"
echo "========================================"

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within timeout"
    return 1
}

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "🔍 Checking service health..."

# Wait for services to be ready
wait_for_service "http://localhost:8000/health" "Backend API"
wait_for_service "http://localhost:3000" "Frontend"
wait_for_service "http://localhost:5050" "pgAdmin"
wait_for_service "http://localhost:8025" "MailHog"

echo ""
echo "🧪 Running API tests..."

# Test backend health endpoint
echo "Testing backend health..."
health_response=$(curl -s http://localhost:8000/health)
echo "Health response: $health_response"

# Test backend root endpoint
echo "Testing backend root..."
root_response=$(curl -s http://localhost:8000/)
echo "Root response: $root_response"

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "🌐 Access your services:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs:    http://localhost:8000/docs"
echo "  pgAdmin:     http://localhost:5050 (admin@harvest.com / admin123)"
echo "  MailHog:     http://localhost:8025"