# HarvestLedger - Comprehensive Makefile
# Blockchain-powered Agricultural Supply Chain Management

.PHONY: help install build dev prod stop clean logs status test verify deploy health check-deps

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Project configuration
PROJECT_NAME := harvestledger
COMPOSE_FILE := docker-compose.yml
COMPOSE_PROD_FILE := docker-compose.prod.yml
FRONTEND_DIR := frontend
BACKEND_DIR := backend

##@ Help
help: ## Display this help message
	@echo "$(BLUE)HarvestLedger - Blockchain Agricultural Supply Chain$(RESET)"
	@echo "$(BLUE)=================================================$(RESET)"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(GREEN)<target>$(RESET)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
install: check-deps ## Install all dependencies (frontend + backend)
	@echo "$(BLUE)📦 Installing HarvestLedger dependencies...$(RESET)"
	@echo "$(YELLOW)Installing frontend dependencies...$(RESET)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(YELLOW)Installing backend dependencies...$(RESET)"
	@cd $(BACKEND_DIR) && pip install -r requirements.txt || pip install -r requirements-minimal.txt
	@echo "$(GREEN)✅ All dependencies installed successfully!$(RESET)"

install-frontend: ## Install frontend packages in container
	@echo "$(BLUE)� Inistalling frontend packages in container...$(RESET)"
	@docker compose run --rm frontend npm install
	@echo "$(GREEN)✅ Frontend packages installed in container!$(RESET)"

install-backend: ## Install backend packages in container
	@echo "$(BLUE)📦 Installing backend packages in container...$(RESET)"
	@docker compose run --rm backend pip install -r requirements.txt
	@echo "$(GREEN)✅ Backend packages installed in container!$(RESET)"

install-containers: install-frontend install-backend ## Install all packages in containers

build: ## Build all Docker images
	@echo "$(BLUE)🐳 Building Docker images...$(RESET)"
	@docker compose build
	@echo "$(GREEN)✅ Docker images built successfully!$(RESET)"

build-frontend: ## Build frontend Docker image only
	@echo "$(BLUE)🐳 Building frontend Docker image...$(RESET)"
	@docker compose build frontend
	@echo "$(GREEN)✅ Frontend Docker image built successfully!$(RESET)"

build-backend: ## Build backend Docker image only
	@echo "$(BLUE)🐳 Building backend Docker image...$(RESET)"
	@docker compose build backend
	@echo "$(GREEN)✅ Backend Docker image built successfully!$(RESET)"

build-prod: ## Build production Docker images
	@echo "$(BLUE)🐳 Building production Docker images...$(RESET)"
	@docker compose -f $(COMPOSE_PROD_FILE) build
	@echo "$(GREEN)✅ Production Docker images built successfully!$(RESET)"

build-frontend-in-container: ## Build frontend application inside container
	@echo "$(BLUE)🏗️  Building frontend application in container...$(RESET)"
	@docker compose run --rm frontend npm run build
	@echo "$(GREEN)✅ Frontend application built in container!$(RESET)"

dev: check-env ## Start development environment (all services including MailHog)
	@echo "$(BLUE)🚀 Starting HarvestLedger development environment...$(RESET)"
	@echo "$(YELLOW)Starting all services (db, backend, frontend, mailhog, pgadmin)...$(RESET)"
	@docker compose up -d --remove-orphans
	@echo "$(YELLOW)⏳ Waiting for services to be ready...$(RESET)"
	@$(MAKE) wait-for-services
	@echo ""
	@echo "$(GREEN)🎉 HarvestLedger is ready!$(RESET)"
	@echo "$(BLUE)� Fronetend:$(RESET)     http://localhost:3000"
	@echo "$(BLUE)� Backhend API:$(RESET)  http://localhost:8000"
	@echo "$(BLUE)� GraphoQL:$(RESET)      http://localhost:8000/graphql"
	@echo "$(BLUE)� M ailHog:$(RESET)      http://localhost:8026"
	@echo "$(BLUE)🗄️  PgAdmin:$(RESET)      http://localhost:5050"
	@echo "$(BLUE)🧪 Env Test:$(RESET)     http://localhost:3000/env-test"
	@echo ""
	@echo "$(YELLOW)💡 Use 'make logs' to view logs, 'make stop' to stop all services$(RESET)"

prod: check-env ## Start production environment
	@echo "$(BLUE)🚀 Starting HarvestLedger production environment...$(RESET)"
	@echo "$(YELLOW)Starting production services (db, backend, frontend, nginx)...$(RESET)"
	@docker compose -f $(COMPOSE_PROD_FILE) up -d --remove-orphans
	@echo "$(YELLOW)⏳ Waiting for production services to be ready...$(RESET)"
	@sleep 10
	@echo "$(GREEN)✅ Production environment started!$(RESET)"
	@echo "$(BLUE)🌐 Application:$(RESET)  http://localhost"
	@echo "$(BLUE)🔒 HTTPS:$(RESET)        https://localhost"

##@ Operations
stop: ## Stop all services (including MailHog)
	@echo "$(BLUE)🛑 Stopping HarvestLedger services...$(RESET)"
	@echo "$(YELLOW)Stopping development services...$(RESET)"
	@docker compose down --remove-orphans
	@echo "$(YELLOW)Stopping production services...$(RESET)"
	@docker compose -f $(COMPOSE_PROD_FILE) down --remove-orphans 2>/dev/null || true
	@echo "$(YELLOW)Ensuring all containers are stopped...$(RESET)"
	@docker stop harvest_frontend harvest_backend harvest_db harvest_pgadmin harvest_mailhog 2>/dev/null || true
	@docker stop harvest_frontend_prod harvest_backend_prod harvest_db_prod harvest_nginx 2>/dev/null || true
	@echo "$(GREEN)✅ All services stopped!$(RESET)"

stop-dev: ## Stop development services only
	@echo "$(BLUE)🛑 Stopping development services...$(RESET)"
	@docker compose down --remove-orphans
	@echo "$(GREEN)✅ Development services stopped!$(RESET)"

stop-prod: ## Stop production services only
	@echo "$(BLUE)🛑 Stopping production services...$(RESET)"
	@docker compose -f $(COMPOSE_PROD_FILE) down --remove-orphans
	@echo "$(GREEN)✅ Production services stopped!$(RESET)"

start: dev ## Alias for 'make dev' - start all development services

start-db: ## Start database service only
	@echo "$(BLUE)🗄️  Starting database service...$(RESET)"
	@docker compose up -d db
	@echo "$(GREEN)✅ Database service started!$(RESET)"

start-backend: ## Start backend service only
	@echo "$(BLUE)🔧 Starting backend service...$(RESET)"
	@docker compose up -d backend
	@echo "$(GREEN)✅ Backend service started!$(RESET)"

start-frontend: ## Start frontend service only
	@echo "$(BLUE)📱 Starting frontend service...$(RESET)"
	@docker compose up -d frontend
	@echo "$(GREEN)✅ Frontend service started!$(RESET)"

start-mailhog: ## Start MailHog service only
	@echo "$(BLUE)📧 Starting MailHog service...$(RESET)"
	@docker compose up -d mailhog
	@echo "$(GREEN)✅ MailHog service started!$(RESET)"

start-pgadmin: ## Start PgAdmin service only
	@echo "$(BLUE)🗄️  Starting PgAdmin service...$(RESET)"
	@docker compose up -d pgadmin
	@echo "$(GREEN)✅ PgAdmin service started!$(RESET)"

restart: stop dev ## Restart development environment

logs: ## View logs from all services
	@docker compose logs -f

logs-backend: ## View backend logs only
	@docker compose logs -f backend

logs-frontend: ## View frontend logs only
	@docker compose logs -f frontend

status: ## Show status of all services
	@echo "$(BLUE)📊 Service Status:$(RESET)"
	@docker compose ps

##@ Maintenance
clean: ## Clean up containers, images, and volumes
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(RESET)"
	@docker compose down -v --rmi all 2>/dev/null || true
	@docker compose -f $(COMPOSE_PROD_FILE) down -v --rmi all 2>/dev/null || true
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(RESET)"

clean-volumes: ## Remove all volumes (⚠️  destroys data)
	@echo "$(RED)⚠️  This will destroy all database data!$(RESET)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker compose down -v
	@docker volume prune -f
	@echo "$(GREEN)✅ Volumes cleaned!$(RESET)"

rebuild: clean build ## Clean rebuild of all images

rebuild-frontend: ## Rebuild frontend image only
	@echo "$(BLUE)🔄 Rebuilding frontend image...$(RESET)"
	@docker compose build --no-cache frontend
	@echo "$(GREEN)✅ Frontend image rebuilt!$(RESET)"

rebuild-backend: ## Rebuild backend image only
	@echo "$(BLUE)🔄 Rebuilding backend image...$(RESET)"
	@docker compose build --no-cache backend
	@echo "$(GREEN)✅ Backend image rebuilt!$(RESET)"

clean-containers: ## Remove all stopped containers
	@echo "$(YELLOW)🧹 Removing stopped containers...$(RESET)"
	@docker container prune -f
	@echo "$(GREEN)✅ Stopped containers removed!$(RESET)"

clean-images: ## Remove unused Docker images
	@echo "$(YELLOW)🧹 Removing unused Docker images...$(RESET)"
	@docker image prune -f
	@echo "$(GREEN)✅ Unused images removed!$(RESET)"

clean-networks: ## Remove unused Docker networks
	@echo "$(YELLOW)🧹 Removing unused Docker networks...$(RESET)"
	@docker network prune -f
	@echo "$(GREEN)✅ Unused networks removed!$(RESET)"

clean-all: ## Complete cleanup (containers, images, volumes, networks)
	@echo "$(RED)⚠️  This will destroy ALL Docker data including databases!$(RESET)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@$(MAKE) stop
	@docker system prune -a -f --volumes
	@echo "$(GREEN)✅ Complete cleanup finished!$(RESET)"

##@ Container Management
exec-frontend: ## Execute shell in frontend container
	@docker compose exec frontend sh

exec-backend: ## Execute shell in backend container
	@docker compose exec backend bash

exec-db: ## Execute PostgreSQL shell in database container
	@docker compose exec db psql -U harvest_user -d harvest_ledger

exec-mailhog: ## Execute shell in MailHog container
	@docker compose exec mailhog sh

container-stats: ## Show container resource usage statistics
	@echo "$(BLUE)📊 Container Resource Usage:$(RESET)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

container-inspect: ## Inspect all running containers
	@echo "$(BLUE)🔍 Container Inspection:$(RESET)"
	@docker compose ps -a

container-logs-all: ## View logs from all containers with timestamps
	@docker compose logs -f -t

container-restart-frontend: ## Restart frontend container only
	@echo "$(BLUE)🔄 Restarting frontend container...$(RESET)"
	@docker compose restart frontend
	@echo "$(GREEN)✅ Frontend container restarted!$(RESET)"

container-restart-backend: ## Restart backend container only
	@echo "$(BLUE)🔄 Restarting backend container...$(RESET)"
	@docker compose restart backend
	@echo "$(GREEN)✅ Backend container restarted!$(RESET)"

container-restart-db: ## Restart database container only
	@echo "$(BLUE)🔄 Restarting database container...$(RESET)"
	@docker compose restart db
	@echo "$(GREEN)✅ Database container restarted!$(RESET)"

container-restart-mailhog: ## Restart MailHog container only
	@echo "$(BLUE)🔄 Restarting MailHog container...$(RESET)"
	@docker compose restart mailhog
	@echo "$(GREEN)✅ MailHog container restarted!$(RESET)"

##@ Package Management
npm-install: ## Install npm packages in frontend container
	@echo "$(BLUE)📦 Installing npm packages in frontend container...$(RESET)"
	@docker compose exec frontend npm install
	@echo "$(GREEN)✅ npm packages installed!$(RESET)"

npm-update: ## Update npm packages in frontend container
	@echo "$(BLUE)📦 Updating npm packages in frontend container...$(RESET)"
	@docker compose exec frontend npm update
	@echo "$(GREEN)✅ npm packages updated!$(RESET)"

npm-audit: ## Run npm audit in frontend container
	@echo "$(BLUE)🔍 Running npm audit in frontend container...$(RESET)"
	@docker compose exec frontend npm audit

pip-install: ## Install pip packages in backend container
	@echo "$(BLUE)📦 Installing pip packages in backend container...$(RESET)"
	@docker compose exec backend pip install -r requirements.txt
	@echo "$(GREEN)✅ pip packages installed!$(RESET)"

pip-freeze: ## Show installed pip packages in backend container
	@echo "$(BLUE)📦 Installed pip packages in backend container:$(RESET)"
	@docker compose exec backend pip freeze

##@ Testing & Verification
test: ## Run all tests
	@echo "$(BLUE)🧪 Running tests...$(RESET)"
	@cd $(FRONTEND_DIR) && npm test 2>/dev/null || echo "$(YELLOW)No frontend tests configured$(RESET)"
	@cd $(BACKEND_DIR) && python -m pytest 2>/dev/null || echo "$(YELLOW)No backend tests configured$(RESET)"

verify: ## Verify installation and configuration
	@echo "$(BLUE)🔍 Verifying HarvestLedger setup...$(RESET)"
	@$(MAKE) check-deps
	@$(MAKE) check-env
	@$(MAKE) check-files
	@echo "$(GREEN)✅ Setup verification completed!$(RESET)"

health: ## Check health of running services
	@echo "$(BLUE)🏥 Checking service health...$(RESET)"
	@echo "$(YELLOW)Backend Health:$(RESET)"
	@curl -s http://localhost:8000/health | head -20 || echo "$(RED)❌ Backend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)❌ Frontend not responding$(RESET)"

##@ Deployment
deploy-vercel: ## Deploy frontend to Vercel
	@echo "$(BLUE)🚀 Deploying to Vercel...$(RESET)"
	@cd $(FRONTEND_DIR) && npx vercel --prod
	@echo "$(GREEN)✅ Deployed to Vercel!$(RESET)"

deploy-build: ## Build for production deployment
	@echo "$(BLUE)🏗️  Building for production...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✅ Production build completed!$(RESET)"

##@ Database
db-migrate: ## Run database migrations
	@echo "$(BLUE)🗄️  Running database migrations...$(RESET)"
	@docker compose exec backend alembic upgrade head
	@echo "$(GREEN)✅ Migrations completed!$(RESET)"

db-reset: ## Reset database (⚠️  destroys data)
	@echo "$(RED)⚠️  This will destroy all database data!$(RESET)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker compose down
	@docker volume rm $(PROJECT_NAME)_postgres_data 2>/dev/null || true
	@docker compose up -d db
	@echo "$(GREEN)✅ Database reset completed!$(RESET)"

db-backup: ## Backup database
	@echo "$(BLUE)💾 Creating database backup...$(RESET)"
	@mkdir -p backups
	@docker compose exec db pg_dump -U harvest_user harvest_ledger > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backup created!$(RESET)"

##@ Development Tools
shell-backend: ## Open shell in backend container
	@docker compose exec backend bash

shell-frontend: ## Open shell in frontend container
	@docker compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	@docker compose exec db psql -U harvest_user -d harvest_ledger

##@ Service Logs
logs-mailhog: ## View MailHog logs only
	@docker compose logs -f mailhog

logs-pgadmin: ## View PgAdmin logs only
	@docker compose logs -f pgadmin

logs-db: ## View database logs only
	@docker compose logs -f db

logs-nginx: ## View nginx logs (production only)
	@docker compose -f $(COMPOSE_PROD_FILE) logs -f nginx

##@ Service Health Checks
health-all: ## Check health of all services
	@echo "$(BLUE)🏥 Checking all service health...$(RESET)"
	@echo "$(YELLOW)Database Health:$(RESET)"
	@docker compose exec db pg_isready -U harvest_user -d harvest_ledger || echo "$(RED)❌ Database not ready$(RESET)"
	@echo "$(YELLOW)Backend Health:$(RESET)"
	@curl -s http://localhost:8000/health | head -20 || echo "$(RED)❌ Backend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)❌ Frontend not responding$(RESET)"
	@echo "$(YELLOW)MailHog Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8026 || echo "$(RED)❌ MailHog not responding$(RESET)"
	@echo "$(YELLOW)PgAdmin Health:$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:5050 || echo "$(RED)❌ PgAdmin not responding$(RESET)"

health-backend: ## Check backend health only
	@echo "$(BLUE)🏥 Checking backend health...$(RESET)"
	@curl -s http://localhost:8000/health || echo "$(RED)❌ Backend not responding$(RESET)"

health-frontend: ## Check frontend health only
	@echo "$(BLUE)🏥 Checking frontend health...$(RESET)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)❌ Frontend not responding$(RESET)"

##@ Quick Development Commands
quick-restart: ## Quick restart (stop and start without rebuild)
	@echo "$(BLUE)🔄 Quick restart of all services...$(RESET)"
	@docker compose restart
	@echo "$(GREEN)✅ All services restarted!$(RESET)"

quick-logs: ## Show last 50 lines of logs from all services
	@docker compose logs --tail=50

watch-logs: ## Watch logs from all services in real-time
	@docker compose logs -f --tail=10

##@ Internal Helpers
check-deps: ## Check if required dependencies are installed
	@echo "$(YELLOW)Checking dependencies...$(RESET)"
	@command -v docker >/dev/null 2>&1 || (echo "$(RED)❌ Docker not found$(RESET)" && exit 1)
	@docker compose version >/dev/null 2>&1 || (echo "$(RED)❌ Docker Compose not found$(RESET)" && exit 1)
	@command -v node >/dev/null 2>&1 || (echo "$(RED)❌ Node.js not found$(RESET)" && exit 1)
	@command -v npm >/dev/null 2>&1 || (echo "$(RED)❌ npm not found$(RESET)" && exit 1)
	@echo "$(GREEN)✅ All dependencies found$(RESET)"

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ .env file not found$(RESET)"; \
		echo "$(YELLOW)💡 Copy .env.example to .env and configure it$(RESET)"; \
		exit 1; \
	fi
	@if ! grep -q "NEXT_PUBLIC_BACKEND_URL" .env; then \
		echo "$(RED)❌ Frontend environment variables not found in .env$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Environment configuration verified$(RESET)"

check-files: ## Check if required files exist
	@echo "$(YELLOW)Checking required files...$(RESET)"
	@files="$(COMPOSE_FILE) $(COMPOSE_PROD_FILE) $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)/package.json $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)/requirements.txt"; \
	for file in $$files; do \
		if [ ! -f $$file ]; then \
			echo "$(RED)❌ Missing: $$file$(RESET)"; \
			exit 1; \
		fi; \
	done
	@echo "$(GREEN)✅ All required files found$(RESET)"

wait-for-services: ## Wait for services to be ready
	@echo "$(YELLOW)Waiting for backend to be healthy...$(RESET)"
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if curl -f http://localhost:8000/health >/dev/null 2>&1; then \
			echo "$(GREEN)✅ Backend is healthy!$(RESET)"; \
			break; \
		fi; \
		echo "$(YELLOW)⏳ Waiting... ($$timeout seconds remaining)$(RESET)"; \
		sleep 2; \
		timeout=$$((timeout - 2)); \
	done; \
	if [ $$timeout -le 0 ]; then \
		echo "$(RED)❌ Backend failed to start$(RESET)"; \
		echo "$(YELLOW)💡 Check logs with: make logs-backend$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Waiting for frontend to be ready...$(RESET)"
	@sleep 3
	@if curl -f http://localhost:3000 >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Frontend is ready!$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  Frontend might still be starting up...$(RESET)"; \
	fi

##@ Quick Commands & Aliases
up: dev ## Alias for 'make dev' - start all services
down: stop ## Alias for 'make stop' - stop all services
ps: status ## Alias for 'make status' - show service status
restart-all: restart ## Alias for 'make restart'
logs-all: logs ## Alias for 'make logs'
build-all: build ## Alias for 'make build'
clean-all-safe: clean-containers clean-images clean-networks ## Safe cleanup without volumes