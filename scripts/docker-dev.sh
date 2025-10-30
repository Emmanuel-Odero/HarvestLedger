#!/bin/bash

# Docker development environment management script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

case "${1:-help}" in
    "up")
        echo "🚀 Starting HarvestLedger development environment..."
        docker-compose up -d
        echo ""
        echo "✅ Services started successfully!"
        echo ""
        echo "📊 Service URLs:"
        echo "  Frontend:    http://localhost:3000"
        echo "  Backend API: http://localhost:8000"
        echo "  API Docs:    http://localhost:8000/docs"
        echo "  pgAdmin:     http://localhost:5050"
        echo "  MailHog UI:  http://localhost:8025"
        echo ""
        echo "🔑 pgAdmin Login:"
        echo "  Email:    admin@harvest.com"
        echo "  Password: admin123"
        echo ""
        echo "📧 SMTP Server (for backend):"
        echo "  Host: mailhog"
        echo "  Port: 1025"
        echo ""
        ;;
    "down")
        echo "🛑 Stopping HarvestLedger development environment..."
        docker-compose down
        echo "✅ Services stopped successfully!"
        ;;
    "restart")
        echo "🔄 Restarting HarvestLedger development environment..."
        docker-compose down
        docker-compose up -d
        echo "✅ Services restarted successfully!"
        ;;
    "logs")
        service="${2:-}"
        if [ -n "$service" ]; then
            echo "📋 Showing logs for $service..."
            docker-compose logs -f "$service"
        else
            echo "📋 Showing logs for all services..."
            docker-compose logs -f
        fi
        ;;
    "status")
        echo "📊 Service status:"
        docker-compose ps
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup completed!"
        ;;
    "build")
        echo "🔨 Building Docker images..."
        docker-compose build --no-cache
        echo "✅ Build completed!"
        ;;
    "help"|*)
        echo "HarvestLedger Docker Development Environment"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  up       Start all services"
        echo "  down     Stop all services"
        echo "  restart  Restart all services"
        echo "  logs     Show logs (optionally for specific service)"
        echo "  status   Show service status"
        echo "  build    Rebuild Docker images"
        echo "  clean    Stop services and clean up volumes"
        echo "  help     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 up                 # Start all services"
        echo "  $0 logs backend       # Show backend logs"
        echo "  $0 logs frontend      # Show frontend logs"
        echo ""
        ;;
esac