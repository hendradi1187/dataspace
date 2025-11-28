# Docker Implementation Guide - Dataspace Platform

## Overview

This guide provides step-by-step instructions for running the complete Dataspace Platform using Docker Compose. The setup supports both development and production environments with automatic database initialization, service orchestration, and health monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Quick Start](#quick-start)
4. [Development Environment](#development-environment)
5. [Production Environment](#production-environment)
6. [Database Management](#database-management)
7. [Service Management](#service-management)
8. [Troubleshooting](#troubleshooting)
9. [Performance Tuning](#performance-tuning)

---

## Prerequisites

### Required Software

- **Docker Desktop**: Version 20.10 or higher
  - [Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [macOS](https://docs.docker.com/desktop/install/mac-install/)
  - [Linux](https://docs.docker.com/engine/install/)

- **Docker Compose**: Version 1.29 or higher (included in Docker Desktop)

- **Git**: For cloning the repository

- **Node.js & pnpm**: For building services locally (optional, Docker handles this)

### System Requirements

**Minimum**:
- CPU: 4 cores
- RAM: 8 GB
- Disk: 20 GB free space

**Recommended**:
- CPU: 8+ cores
- RAM: 16+ GB
- Disk: 50 GB free space

### Port Requirements

Ensure these ports are available on your machine:
- `5432` - PostgreSQL
- `3000-3011` - Backend services (12 services)
- `5174` - Frontend

---

## Project Structure

```
dataspace/
├── infra/
│   └── docker/
│       ├── Dockerfile.service           # Template for backend services
│       ├── docker-compose.dev.yml      # Development environment config
│       ├── docker-compose.yml          # Production environment config
│       ├── nginx.conf                  # Frontend reverse proxy config
│       ├── .dockerignore               # Files to exclude from builds
│       └── DOCKER_IMPLEMENTATION_GUIDE.md  # This file
├── apps/
│   └── frontend/
│       └── Dockerfile                  # Frontend build config
├── services/
│   └── cts/
│       ├── idp/                        # Identity Provider service
│       ├── broker/                     # Broker service
│       ├── hub/                        # Hub service
│       ├── trustcore-policy/           # Policy service
│       ├── trustcore-contract/         # Contract service
│       ├── trustcore-compliance/       # Compliance service
│       ├── trustcore-ledger/           # Ledger service
│       ├── clearing/                   # Clearing service
│       ├── appstore/                   # AppStore service
│       ├── connector/                  # Connector service
│       ├── trustcore-clearing/         # TrustCore Clearing service
│       └── trustcore-connector/        # TrustCore Connector service
├── db/
│   └── init/
│       ├── 00-init-database.sql       # Database & schema creation
│       ├── 01-init-schema.sql         # Table definitions & relationships
│       └── 02-seed-data.sql           # Test data population
└── docker-compose.yml                  # Main compose file (symlink or copy)
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/dataspace.git
cd dataspace
```

### 2. Development Environment

Start all services for development:

```bash
docker-compose -f infra/docker/docker-compose.dev.yml up -d
```

Monitor logs:

```bash
docker-compose -f infra/docker/docker-compose.dev.yml logs -f
```

Check service status:

```bash
docker-compose -f infra/docker/docker-compose.dev.yml ps
```

Stop all services:

```bash
docker-compose -f infra/docker/docker-compose.dev.yml down
```

### 3. Access Services

Once all containers are healthy:

- **Frontend**: http://localhost:5174
- **IDP**: http://localhost:3000
- **Broker**: http://localhost:3001
- **Hub**: http://localhost:3002
- **Policy**: http://localhost:3003
- **Contract**: http://localhost:3004
- **Compliance**: http://localhost:3005
- **Ledger**: http://localhost:3006
- **Clearing**: http://localhost:3007
- **AppStore**: http://localhost:3008
- **Connector**: http://localhost:3009
- **TrustCore Clearing**: http://localhost:3010
- **TrustCore Connector**: http://localhost:3011

---

## Development Environment

### Configuration

The development compose file (`docker-compose.dev.yml`) includes:

- **Hot reload**: Source code volumes mounted for live development
- **Debug logging**: All services set to `debug` log level
- **Single replicas**: One instance of each service for easier debugging
- **Database initialization**: Auto-run SQL scripts on startup
- **Health checks**: Enabled for all services

### Starting Development Services

```bash
cd infra/docker
docker-compose -f docker-compose.dev.yml up -d
```

### Viewing Logs

View logs for all services:
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

View logs for a specific service:
```bash
docker-compose -f docker-compose.dev.yml logs -f idp
```

Follow specific log patterns:
```bash
docker-compose -f docker-compose.dev.yml logs -f | grep "ERROR"
```

### Code Changes & Hot Reload

Development volumes are configured for:
- Backend services: `services/cts/[service]/src` mounted to `/app/services/cts/[service]/src`
- Logs: `logs/` mounted to `/app/logs`

Changes to source files in these directories are reflected immediately in the running containers.

### Database Access (Development)

Connect to PostgreSQL directly:

```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d dataspace_dev
```

Common database commands:
```sql
-- List all tables
\dt

-- View participants
SELECT * FROM participants;

-- View datasets
SELECT * FROM datasets;

-- Check table structure
\d participants

-- Count records in each table
SELECT tablename, (xpath('//row', xml_count))[1]::text::int as count
FROM (SELECT tablename, query_to_xml('SELECT count(*) FROM ' || tablename, false, false, '') as xml_count FROM pg_tables WHERE schemaname = 'public') t;
```

### Rebuilding Services (After Code Changes)

Rebuild a specific service:
```bash
docker-compose -f docker-compose.dev.yml build --no-cache idp
```

Rebuild all services:
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

Rebuild and restart a service:
```bash
docker-compose -f docker-compose.dev.yml up --build -d idp
```

---

## Production Environment

### Configuration

The production compose file (`docker-compose.yml`) includes:

- **Multi-replicas**: 2 replicas for web services (idp, broker, hub, frontend) for redundancy
- **Resource limits**: CPU and memory limits to prevent resource exhaustion
- **Info logging**: Services set to `info` log level for reduced noise
- **Volume handling**: Read-only mounts for initialization scripts, persistent data volumes
- **Environment variables**: Configurable via `.env` file
- **Health checks**: Stricter timeouts and retries

### Starting Production Services

Create `.env` file in the root directory:

```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=secure_password_here
DB_NAME=dataspace_prod
DB_PORT=5432

# Service Configuration
NODE_ENV=production
LOG_LEVEL=info
```

Start services:
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Scaling Services

Scale a specific service:
```bash
docker-compose -f infra/docker/docker-compose.yml up -d --scale idp=3
```

### Production Database

Backup database:
```bash
docker-compose -f infra/docker/docker-compose.yml exec postgres pg_dump -U postgres dataspace_prod > backup.sql
```

Restore database:
```bash
docker-compose -f infra/docker/docker-compose.yml exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

---

## Database Management

### Initialization Process

The database initializes automatically in three phases:

**Phase 1**: `00-init-database.sql`
- Creates `dataspace_dev` or `dataspace_prod` database
- Installs PostgreSQL extensions (uuid-ossp, postgis, hstore)
- Sets up schema and permissions

**Phase 2**: `01-init-schema.sql`
- Creates 14 core tables
- Defines relationships and indexes
- Creates 3 convenience views

**Phase 3**: `02-seed-data.sql`
- Populates test data for development
- Creates 10 test participants
- Generates sample datasets, schemas, policies, contracts

### Manual Database Operations

Access database shell:
```bash
docker-compose exec postgres psql -U postgres -d dataspace_dev
```

Run SQL script:
```bash
docker-compose exec -T postgres psql -U postgres -d dataspace_dev < ./db/init/custom-script.sql
```

Export data:
```bash
docker-compose exec postgres pg_dump -U postgres -d dataspace_dev --format=custom > backup.dump
```

### Database Verification

Check if database initialized successfully:
```bash
docker-compose exec postgres psql -U postgres -d dataspace_dev -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema='public';"
```

Expected result: 14 tables + 3 views

View initialization logs:
```bash
docker-compose logs postgres | grep -i "init\|error\|successful"
```

---

## Service Management

### Health Check Status

View health status of all services:
```bash
docker-compose -f docker-compose.dev.yml ps
```

Status indicators:
- `Up (healthy)` - Service is running and responding to health checks
- `Up (starting)` - Service is still starting
- `Up` - Service running but no health check
- `Exited` - Service has stopped

### Service Logs

Real-time logs for specific service:
```bash
docker-compose -f docker-compose.dev.yml logs -f --tail=50 idp
```

View logs with timestamps:
```bash
docker-compose -f docker-compose.dev.yml logs --timestamps idp
```

### Restarting Services

Restart specific service:
```bash
docker-compose -f docker-compose.dev.yml restart idp
```

Restart all services:
```bash
docker-compose -f docker-compose.dev.yml restart
```

Force restart (stop then start):
```bash
docker-compose -f docker-compose.dev.yml up -d --force-recreate idp
```

### Inspecting Services

Get service details:
```bash
docker-compose -f docker-compose.dev.yml exec idp cat /etc/os-release
```

Check environment variables:
```bash
docker-compose -f docker-compose.dev.yml exec idp env
```

Check running processes:
```bash
docker-compose -f docker-compose.dev.yml exec idp ps aux
```

---

## Troubleshooting

### Service Won't Start

Check logs:
```bash
docker-compose logs [service-name]
```

Common issues:
1. **Port already in use** - Change the port mapping in compose file
2. **Insufficient memory** - Increase Docker's memory allocation
3. **Database not ready** - Wait for postgres `service_healthy` status

### Database Connection Errors

Verify PostgreSQL is running:
```bash
docker-compose ps postgres
```

Test database connection:
```bash
docker-compose exec postgres pg_isready -U postgres
```

Check database exists:
```bash
docker-compose exec postgres psql -U postgres -l
```

### Service Timeouts

Increase health check timeouts in compose file:
```yaml
healthcheck:
  timeout: 20s  # Increase from 10s
```

Or rebuild service:
```bash
docker-compose build --no-cache [service-name]
```

### High Memory Usage

Check memory consumption:
```bash
docker stats
```

Reduce service replicas:
```bash
docker-compose up -d --scale idp=1
```

### Volume Mounting Issues (Windows)

If source code changes aren't reflected:
1. Ensure Docker Desktop has access to your local drive (Settings → Resources → File Sharing)
2. Use forward slashes in paths: `./services/` not `.\services\`
3. Restart Docker Desktop

### Network Issues Between Services

Check network status:
```bash
docker network inspect dataspace-net
```

Verify service DNS resolution:
```bash
docker-compose exec idp nslookup broker
```

---

## Performance Tuning

### Docker Resource Allocation

Increase memory in Docker Desktop:
1. Open Docker Desktop Settings
2. Navigate to Resources
3. Increase memory allocation (recommended: 8-16GB)

### Database Performance

Enable query logging:
```bash
docker-compose exec postgres psql -U postgres -d dataspace_dev -c "ALTER SYSTEM SET log_min_duration_statement = 100;"
```

Check slow queries:
```bash
docker-compose logs postgres | grep "slow query"
```

### Frontend Optimization

The frontend is served via Nginx with:
- Gzip compression enabled
- Static asset caching (1 year)
- Browser cache optimization

Verify compression is working:
```bash
curl -I http://localhost:5174
```

Look for `Content-Encoding: gzip`

### Service Optimization

Monitor service performance:
```bash
docker stats --no-stream
```

Reduce logging verbosity in production:
```yaml
environment:
  LOG_LEVEL: warn
```

---

## Common Commands Reference

```bash
# Development startup
docker-compose -f infra/docker/docker-compose.dev.yml up -d

# View running services
docker-compose -f infra/docker/docker-compose.dev.yml ps

# Stream logs
docker-compose -f infra/docker/docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f infra/docker/docker-compose.dev.yml down

# Rebuild specific service
docker-compose -f infra/docker/docker-compose.dev.yml build --no-cache [service]

# Access database
docker-compose -f infra/docker/docker-compose.dev.yml exec postgres psql -U postgres -d dataspace_dev

# Production deployment
docker-compose -f infra/docker/docker-compose.yml up -d

# Production logs
docker-compose -f infra/docker/docker-compose.yml logs -f

# Production shutdown
docker-compose -f infra/docker/docker-compose.yml down
```

---

## Next Steps

1. **Run the stack**: `docker-compose -f infra/docker/docker-compose.dev.yml up -d`
2. **Verify services**: `docker-compose -f infra/docker/docker-compose.dev.yml ps`
3. **Access frontend**: http://localhost:5174
4. **Check database**: `docker-compose -f infra/docker/docker-compose.dev.yml exec postgres psql -U postgres -d dataspace_dev -c "SELECT count(*) FROM participants;"`
5. **View logs**: `docker-compose -f infra/docker/docker-compose.dev.yml logs -f`

For production deployment, see the [Production Environment](#production-environment) section.

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
