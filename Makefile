# HarvestLedger - Production Makefile
.PHONY: help install build dev prod stop clean logs status health

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

##@ Help
help: ## Display this help message
	@echo "$(BLUE)HarvestLedger - Blockchain Agricultural Platform$(RESET)"
	@echo "$(BLUE)=============================================$(RESET)"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(GREEN)<target>$(RESET)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $1, $2 } /^##@/ { printf "\n$(BLUE)%s$(RESET)\n", substr($0, 5) } ' $(MAKEFILE_LIST)

##@ Development
install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(RESET)"
	@cd frontend && npm install
	@cd backend && pip install -r requirements.txt
	@echo "$(GREEN)✅ Dependencies installed$(RESET)"

build: ## Build Docker images
	@echo "$(BLUE)🐳 Building Docker images...$(RESET)"
	@docker compose build
	@echo "$(GREEN)✅ Images built successfully$(RESET)"

dev: ## Start development environment
	@echo "$(BLUE)🚀 Starting development environment...$(RESET)"
	@docker compose up -d --remove-orphans
	@echo "$(YELLOW)⏳ Waiting for services...$(RESET)"
	@sleep 10
	@echo "$(GREEN)🎉 Development environment ready!$(RESET)"
	@echo "$(BLUE)🌐 Frontend:$(RESET)     http://localhost:3000"
	@echo "$(BLUE)🔧 Backend API:$(RESET)  http://localhost:8000"
	@echo "$(BLUE)📊 GraphQL:$(RESET)      http://localhost:8000/graphql"
	@echo "$(BLUE)🗄️  PgAdmin:$(RESET)      http://localhost:5050"

prod: ## Start production environment
	@echo "$(BLUE)🚀 Starting production environment...$(RESET)"
	@docker compose -f docker-compose.prod.yml up -d --remove-orphans
	@echo "$(GREEN)✅ Production environment started$(RESET)"
	@echo "$(BLUE)🌐 Application:$(RESET)  http://localhost"

##@ Operations
stop: ## Stop all services
	@echo "$(BLUE)🛑 Stopping services...$(RESET)"
	@docker compose down --remove-orphans
	@docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
	@echo "$(GREEN)✅ Services stopped$(RESET)"

restart: stop dev ## Restart development environment

logs: ## View logs from all services
	@docker compose logs -f

status: ## Show status of all services
	@echo "$(BLUE)📊 Service Status:$(RESET)"
	@docker compose ps

##@ Maintenance
clean: ## Clean up Docker resources
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(RESET)"
	@docker compose down -v --rmi all 2>/dev/null || true
	@docker compose -f docker-compose.prod.yml down -v --rmi all 2>/dev/null || true
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed$(RESET)"

rebuild: clean build ## Clean rebuild of all images

##@ Health & Testing
health: ## Check health of running services
	@echo "$(BLUE)🏥 Checking service health...$(RESET)"
	@echo "$(YELLOW)Backend Health:$(RESET)"
	@curl -s http://localhost:8000/health | head -20 || echo "$(RED)❌ Backend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)❌ Frontend not responding$(RESET)"

##@ Database
db-shell: ## Open PostgreSQL shell
	@docker compose exec db psql -U harvest_user -d harvest_ledger

db-backup: ## Backup database
	@echo "$(BLUE)💾 Creating database backup...$(RESET)"
	@mkdir -p backups
	@docker compose exec db pg_dump -U harvest_user harvest_ledger > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backup created$(RESET)"

##@ Container Management
shell-backend: ## Execute shell in backend container
	@docker compose exec backend bash

shell-frontend: ## Execute shell in frontend container
	@docker compose exec frontend sh

##@ Quick Commands
up: dev ## Alias for 'make dev'
down: stop ## Alias for 'make stop'
ps: status ## Alias for 'make status'
