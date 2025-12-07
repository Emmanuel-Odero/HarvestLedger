# Makefile Command Guide

This document provides a comprehensive guide to all available `make` commands in the HarvestLedger project.

## Quick Reference

```bash
make help              # Display all available commands
make status            # Show service status
make health            # Check service health
make cardano-test      # Run Cardano integration tests
make cardano-validate  # Validate Cardano setup
```

## Command Categories

### 📋 Help & Information

#### `make help`

Display all available commands with descriptions.

```bash
make help
```

**Output**: Formatted list of all make targets organized by category.

---

### 🚀 Development Commands

#### `make install`

Install all project dependencies (frontend and backend).

```bash
make install
```

**What it does**:

- Installs frontend npm packages
- Installs backend Python packages from requirements.txt

**When to use**: First time setup or after pulling dependency changes.

---

#### `make install-hedera`

Install Hedera SDK specifically.

```bash
make install-hedera
```

**What it does**: Installs the `hedera-sdk-py` package.

**When to use**: When Hedera SDK needs to be reinstalled or updated.

---

#### `make build`

Build all Docker images.

```bash
make build
```

**What it does**: Builds Docker images for all services (frontend, backend, database, etc.).

**When to use**: After modifying Dockerfiles or when dependencies change.

---

#### `make dev`

Start the development environment.

```bash
make dev
```

**What it does**:

- Starts all Docker containers in detached mode
- Waits for services to be ready
- Displays service URLs

**Services started**:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- GraphQL: http://localhost:8000/graphql
- PgAdmin: http://localhost:5050

**When to use**: Daily development work.

---

#### `make prod`

Start the production environment.

```bash
make prod
```

**What it does**: Starts services using production configuration (docker-compose.prod.yml).

**When to use**: Testing production builds locally.

---

### 🛠️ Operations Commands

#### `make stop`

Stop all running services.

```bash
make stop
```

**What it does**:

- Stops all Docker containers
- Removes orphaned containers
- Stops both dev and prod environments

**When to use**: When you're done working or need to free up resources.

---

#### `make restart`

Restart the development environment.

```bash
make restart
```

**What it does**: Stops all services and starts dev environment (equivalent to `make stop dev`).

**When to use**: After configuration changes or when services need a fresh start.

---

#### `make logs`

View logs from all services.

```bash
make logs
```

**What it does**: Displays real-time logs from all Docker containers.

**When to use**: Debugging issues or monitoring service activity.

**Tip**: Press `Ctrl+C` to exit log viewing.

---

#### `make status` (alias: `make ps`)

Show the status of all services.

```bash
make status
# or
make ps
```

**What it does**: Displays running containers with their status, ports, and health.

**When to use**: Quick check to see which services are running.

---

### 🧹 Maintenance Commands

#### `make clean`

Clean up all Docker resources.

```bash
make clean
```

**What it does**:

- Stops all containers
- Removes volumes (⚠️ deletes all data)
- Removes images
- Prunes Docker system

**When to use**: Fresh start or when disk space is needed.

**⚠️ Warning**: This deletes all database data!

---

#### `make rebuild`

Clean rebuild of all images.

```bash
make rebuild
```

**What it does**: Runs `make clean` followed by `make build`.

**When to use**: When you need a completely fresh build.

---

#### `make rebuild-hedera`

Rebuild backend container with Hedera SDK.

```bash
make rebuild-hedera
```

**What it does**: Rebuilds only the backend container without cache.

**When to use**: After Hedera SDK updates or backend dependency changes.

---

### 🏥 Health & Testing Commands

#### `make health`

Check the health of running services.

```bash
make health
```

**What it does**:

- Checks backend health endpoint
- Checks frontend accessibility
- Displays health status

**When to use**: Verify services are running correctly.

---

#### `make verify-hedera`

Verify Hedera SDK installation in container.

```bash
make verify-hedera
```

**What it does**: Runs verification script to check Hedera SDK is properly installed.

**When to use**: After installing or updating Hedera SDK.

---

#### `make cardano-test`

Run Cardano integration tests.

```bash
make cardano-test
```

**What it does**:

- Runs backend Cardano integration tests (Python)
- Runs frontend Cardano integration tests (Jest)
- Displays test results

**Test coverage**:

- Wallet connection flow
- Token minting flow
- Token transfer flow
- Supply chain metadata
- Multi-chain switching
- Database persistence
- End-to-end integration

**When to use**: After making changes to Cardano integration code.

---

#### `make cardano-setup`

Setup Cardano development environment.

```bash
make cardano-setup
```

**What it does**:

- Installs MeshJS dependencies (@meshsdk/core, @meshsdk/react)
- Installs PyCardano and Blockfrost-python
- Validates environment variables
- Provides setup guidance

**When to use**: First time Cardano setup or after dependency updates.

---

#### `make cardano-docker-test`

Test Cardano integration in Docker environment.

```bash
make cardano-docker-test
```

**What it does**:

- Builds Docker images
- Starts all services
- Validates Cardano dependencies
- Runs integration tests in containers
- Tests API endpoints
- Validates UI components

**When to use**: Before deploying or to test in containerized environment.

---

#### `make cardano-validate`

Validate Cardano integration readiness.

```bash
make cardano-validate
```

**What it does**:

- Checks Docker status
- Verifies service status
- Validates configuration files
- Checks all required files exist
- Validates environment variables
- Provides next steps guidance

**When to use**: Quick check to ensure Cardano integration is properly set up.

---

### 🗄️ Database Commands

#### `make db-shell`

Open PostgreSQL shell.

```bash
make db-shell
```

**What it does**: Opens an interactive psql shell connected to the database.

**When to use**: Direct database queries or manual data inspection.

**Example queries**:

```sql
\dt                    -- List all tables
SELECT * FROM users;   -- Query users
\q                     -- Quit
```

---

#### `make db-backup`

Backup the database.

```bash
make db-backup
```

**What it does**:

- Creates a SQL dump of the database
- Saves to `backups/backup_YYYYMMDD_HHMMSS.sql`

**When to use**: Before major changes or for regular backups.

---

### 🐚 Container Management Commands

#### `make shell-backend`

Execute shell in backend container.

```bash
make shell-backend
```

**What it does**: Opens a bash shell inside the backend container.

**When to use**: Debugging, running Python scripts, or inspecting backend environment.

**Example commands**:

```bash
python manage.py migrate
pip list
env | grep CARDANO
```

---

#### `make shell-frontend`

Execute shell in frontend container.

```bash
make shell-frontend
```

**What it does**: Opens a shell inside the frontend container.

**When to use**: Debugging, running npm commands, or inspecting frontend environment.

**Example commands**:

```bash
npm list
npm run build
ls -la
```

---

### ⚡ Quick Commands (Aliases)

#### `make up`

Alias for `make dev`.

```bash
make up
```

---

#### `make down`

Alias for `make stop`.

```bash
make down
```

---

## Common Workflows

### Daily Development

```bash
# Start services
make dev

# Check status
make status

# View logs
make logs

# Stop when done
make stop
```

### Testing Cardano Integration

```bash
# Validate setup
make cardano-validate

# Run tests
make cardano-test

# Test in Docker
make cardano-docker-test
```

### Fresh Start

```bash
# Clean everything
make clean

# Rebuild images
make build

# Start services
make dev
```

### Debugging Issues

```bash
# Check service health
make health

# View logs
make logs

# Check service status
make status

# Open backend shell
make shell-backend
```

### Database Operations

```bash
# Backup database
make db-backup

# Open database shell
make db-shell

# Query data
SELECT * FROM cardano_wallets;
```

## Environment Variables

Key environment variables used by make commands:

- `BLOCKFROST_PROJECT_ID` - Blockfrost API key for Cardano
- `CARDANO_NETWORK` - Cardano network (preprod/mainnet)
- `DATABASE_URL` - PostgreSQL connection string
- `HEDERA_ACCOUNT_ID` - Hedera account ID
- `HEDERA_PRIVATE_KEY` - Hedera private key

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check for port conflicts
docker compose ps

# Clean and rebuild
make clean
make build
make dev
```

### Tests Failing

```bash
# Validate setup
make cardano-validate

# Check service health
make health

# View backend logs
docker compose logs backend

# Run tests with verbose output
python backend/tests/run_integration_test.py
```

### Database Issues

```bash
# Check database status
make status

# View database logs
docker compose logs db

# Backup before changes
make db-backup

# Reset database (⚠️ deletes data)
make clean
make dev
```

## Performance Tips

- Use `make status` instead of `docker compose ps` for formatted output
- Use `make logs` with `grep` to filter: `make logs | grep ERROR`
- Run `make cardano-validate` before `make cardano-test` to catch setup issues early
- Use `make restart` instead of `make stop && make dev` for faster restarts

## Additional Resources

- [CARDANO_SETUP.md](./CARDANO_SETUP.md) - Cardano setup guide
- [CARDANO_TESTING.md](./CARDANO_TESTING.md) - Comprehensive testing guide
- [README.md](./README.md) - Project overview
- [docker-compose.yml](./docker-compose.yml) - Docker configuration

## Getting Help

```bash
# Display all commands
make help

# Check service status
make status

# Validate Cardano setup
make cardano-validate
```

For more help, see the documentation files or check the logs with `make logs`.
