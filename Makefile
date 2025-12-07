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

install-hedera: ## Install Hedera SDK specifically
	@echo "$(BLUE)🔗 Installing Hedera SDK...$(RESET)"
	@cd backend && pip install hedera-sdk-py
	@echo "$(GREEN)✅ Hedera SDK installed$(RESET)"

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
	@echo "$(BLUE)📧 MailHog:$(RESET)      http://localhost:8025"

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

rebuild-hedera: ## Rebuild containers with Hedera SDK
	@echo "$(BLUE)🔗 Rebuilding containers with Hedera SDK...$(RESET)"
	@docker compose build --no-cache backend
	@echo "$(GREEN)✅ Backend container rebuilt with Hedera SDK$(RESET)"

##@ Health & Testing
health: ## Check health of running services
	@echo "$(BLUE)🏥 Checking service health...$(RESET)"
	@echo "$(YELLOW)Backend Health:$(RESET)"
	@curl -s http://localhost:8000/health | head -20 || echo "$(RED)❌ Backend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)❌ Frontend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)MailHog Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8025 || echo "$(RED)❌ MailHog not responding$(RESET)"

verify-hedera: ## Verify Hedera SDK installation in container
	@echo "$(BLUE)🔗 Verifying Hedera SDK installation...$(RESET)"
	@docker compose exec backend python verify-hedera-sdk.py || echo "$(RED)❌ Hedera SDK verification failed$(RESET)"

cardano-test: ## Run Cardano integration tests
	@echo "$(BLUE)🧪 Running Cardano integration tests...$(RESET)"
	@echo "$(YELLOW)Backend Tests:$(RESET)"
	@python backend/tests/run_integration_test.py
	@echo ""
	@echo "$(YELLOW)Frontend Tests:$(RESET)"
	@cd frontend && npm test -- lib/__tests__/integration-cardano.test.ts
	@echo "$(GREEN)✅ Cardano tests completed$(RESET)"

cardano-setup: ## Setup Cardano development environment
	@echo "$(BLUE)🔧 Setting up Cardano development environment...$(RESET)"
	@echo "$(YELLOW)Installing MeshJS dependencies...$(RESET)"
	@cd frontend && npm install @meshsdk/core @meshsdk/react
	@echo "$(YELLOW)Installing PyCardano...$(RESET)"
	@cd backend && pip install pycardano blockfrost-python
	@echo "$(YELLOW)Checking environment variables...$(RESET)"
	@if [ -z "$$BLOCKFROST_PROJECT_ID" ]; then \
		echo "$(RED)⚠️  BLOCKFROST_PROJECT_ID not set$(RESET)"; \
		echo "$(YELLOW)Please add BLOCKFROST_PROJECT_ID to your .env file$(RESET)"; \
		echo "$(YELLOW)Get your API key from: https://blockfrost.io$(RESET)"; \
	else \
		echo "$(GREEN)✅ BLOCKFROST_PROJECT_ID is set$(RESET)"; \
	fi
	@echo "$(GREEN)✅ Cardano setup completed$(RESET)"
	@echo "$(BLUE)📖 See CARDANO_SETUP.md for wallet installation instructions$(RESET)"

cardano-docker-test: ## Test Cardano integration in Docker environment
	@bash scripts/test-cardano-docker.sh

cardano-validate: ## Validate Cardano integration readiness
	@bash scripts/validate-cardano-docker.sh

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

##@ Email Testing
mailhog: ## Open MailHog web interface
	@echo "$(BLUE)📧 Opening MailHog web interface...$(RESET)"
	@echo "$(GREEN)MailHog UI:$(RESET) http://localhost:8025"
	@open http://localhost:8025 2>/dev/null || xdg-open http://localhost:8025 2>/dev/null || echo "$(YELLOW)Please open http://localhost:8025 in your browser$(RESET)"

##@ Quick Commands
up: dev ## Alias for 'make dev'
down: stop ## Alias for 'make stop'
ps: status ## Alias for 'make status'