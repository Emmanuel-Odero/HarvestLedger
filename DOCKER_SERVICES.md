# Docker Services Guide

This document describes the Docker services included in the HarvestLedger development environment.

## Services Overview

### Core Application Services

#### 1. PostgreSQL Database (`db`)

- **Image**: `postgres:16`
- **Port**: `5432`
- **Database**: `harvest_ledger`
- **User**: `harvest_user`
- **Password**: `harvest_pass`
- **Health Check**: Automatic PostgreSQL readiness check

#### 2. Backend API (`backend`)

- **Build**: Custom Dockerfile from `./backend`
- **Port**: `8000`
- **Framework**: FastAPI with GraphQL
- **Features**:
  - Auto-reload for development
  - Health check endpoint at `/health`
  - API documentation at `/docs`
  - GraphQL playground at `/graphql`

#### 3. Frontend (`frontend`)

- **Build**: Custom Dockerfile from `./frontend`
- **Port**: `3000`
- **Framework**: Next.js with React
- **Features**:
  - Hot reload for development
  - Tailwind CSS styling
  - Apollo GraphQL client

### Development Tools

#### 4. pgAdmin (`pgadmin`)

- **Image**: `dpage/pgadmin4:latest`
- **Port**: `5050`
- **Purpose**: PostgreSQL database administration
- **Login**:
  - Email: `admin@harvest.com`
  - Password: `admin123`
- **Features**:
  - Pre-configured connection to HarvestLedger database
  - Web-based database management
  - Query editor and data visualization

#### 5. MailHog (`mailhog`)

- **Image**: `mailhog/mailhog:latest`
- **Ports**:
  - SMTP: `1025`
  - Web UI: `8025`
- **Purpose**: Email testing and debugging
- **Features**:
  - Catches all outgoing emails from the backend
  - Web interface to view sent emails
  - No actual email delivery (development only)

## Quick Start Commands

### Using the Docker Development Script

```bash
# Start all services
./scripts/docker-dev.sh up

# View service status
./scripts/docker-dev.sh status

# View logs for all services
./scripts/docker-dev.sh logs

# View logs for specific service
./scripts/docker-dev.sh logs backend
./scripts/docker-dev.sh logs frontend

# Restart all services
./scripts/docker-dev.sh restart

# Stop all services
./scripts/docker-dev.sh down

# Clean up (removes volumes)
./scripts/docker-dev.sh clean
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## Service URLs

| Service      | URL                           | Purpose                       |
| ------------ | ----------------------------- | ----------------------------- |
| Frontend     | http://localhost:3000         | Main application interface    |
| Backend API  | http://localhost:8000         | REST API endpoints            |
| API Docs     | http://localhost:8000/docs    | Interactive API documentation |
| GraphQL      | http://localhost:8000/graphql | GraphQL playground            |
| Health Check | http://localhost:8000/health  | Service health status         |
| pgAdmin      | http://localhost:5050         | Database administration       |
| MailHog UI   | http://localhost:8025         | Email testing interface       |

## Database Connection

### From pgAdmin

The database connection is pre-configured in pgAdmin:

- **Host**: `db` (Docker service name)
- **Port**: `5432`
- **Database**: `harvest_ledger`
- **Username**: `harvest_user`
- **Password**: `harvest_pass`

### From External Tools

If connecting from outside Docker (e.g., local database client):

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `harvest_ledger`
- **Username**: `harvest_user`
- **Password**: `harvest_pass`

## Email Testing with MailHog

### Backend Configuration

The backend is configured to send emails through MailHog:

```env
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_TLS=false
```

### Viewing Emails

1. Open http://localhost:8025 in your browser
2. All emails sent by the backend will appear here
3. Click on any email to view its content
4. Use the search and filter features to find specific emails

## Troubleshooting

### Service Won't Start

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service_name]

# Restart specific service
docker-compose restart [service_name]
```

### Database Connection Issues

```bash
# Check database health
docker-compose exec db pg_isready -U harvest_user -d harvest_ledger

# Connect to database directly
docker-compose exec db psql -U harvest_user -d harvest_ledger
```

### Port Conflicts

If you get port binding errors, check if the ports are already in use:

```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 8000
lsof -i :8000
```

### Clean Restart

If you encounter persistent issues:

```bash
# Stop and remove everything
docker-compose down -v

# Remove unused Docker resources
docker system prune -f

# Rebuild and start
docker-compose up --build
```

## Development Workflow

1. **Start Services**: `./scripts/docker-dev.sh up`
2. **Check Status**: `./scripts/docker-dev.sh status`
3. **Develop**: Edit code in `./backend` or `./frontend` directories
4. **View Changes**: Services auto-reload on file changes
5. **Test Emails**: Check MailHog UI for any emails sent
6. **Database Work**: Use pgAdmin for database operations
7. **Debug**: Use `./scripts/docker-dev.sh logs [service]` to view logs

## Production Notes

- This configuration is for development only
- MailHog should not be used in production
- pgAdmin should be secured or removed in production
- Use `docker-compose.prod.yml` for production deployments
- Ensure proper secrets management in production
