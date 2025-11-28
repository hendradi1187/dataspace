# Docker Production Deployment Guide

## Overview

Panduan lengkap untuk deploy Dataspace di production server menggunakan Docker Compose. File konfigurasi sudah siap dan di-optimize untuk production environment.

---

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+, Debian 11+) atau dapat juga Windows Server dengan Docker Desktop
- **Docker**: v20.10 atau lebih baru
- **Docker Compose**: v2.0 atau lebih baru
- **RAM**: Minimal 16GB (32GB recommended untuk production)
- **Disk Space**: 50GB+ free space
- **CPU**: 8+ cores recommended

### Installation (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version
docker-compose --version

# Add current user to docker group (optional, untuk tidak perlu sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## File Structure

```
/opt/dataspace/                                 # Project root di server
├── .env.docker-compose                         # Environment variables (CRITICAL!)
├── docker-compose.production.yml               # Production config
├── start-docker-production.sh                  # Control script (Linux)
├── start-docker-production.bat                 # Control script (Windows)
├── infra/docker/
│   ├── docker-compose.production.yml
│   ├── Dockerfile.service                      # Generic service Dockerfile
│   └── traefik/
│       ├── traefik.yml
│       └── dynamic.yml
├── db/
│   └── init/                                   # Database initialization scripts
│       ├── 00-init-database.sql
│       ├── 01-init-schema.sql
│       └── 02-seed-data.sql
├── services/cts/                               # Microservices
│   ├── idp/
│   ├── broker/
│   ├── hub/
│   └── ... (11 total services)
└── apps/
    └── frontend/                               # React+Vite frontend
```

---

## Configuration (.env.docker-compose)

**File location**: `/opt/dataspace/.env.docker-compose`

### Critical Variables to Update for Production

```bash
# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DB_HOST=postgres                    # Internal Docker hostname
DB_PORT=5432
DB_NAME=dataspace_prod
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!  # CHANGE THIS! Use strong password

# ============================================================================
# REDIS CONFIGURATION
# ============================================================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YourSecureRedisPass! # CHANGE THIS!

# ============================================================================
# KAFKA CONFIGURATION
# ============================================================================
KAFKA_BROKERS=kafka:29092           # Internal hostname

# ============================================================================
# JWT SECURITY
# ============================================================================
JWT_SECRET=GenerateRandomString_$(date +%s)_$(openssl rand -hex 32)
JWT_EXPIRY=24h

# ============================================================================
# FRONTEND URLs (update dengan server IP/domain)
# ============================================================================
VITE_API_URL=http://45.158.126.171
VITE_IDP_API_URL=http://45.158.126.171:3000
VITE_BROKER_API_URL=http://45.158.126.171:3001
# ... semua service URLs dengan IP server
```

### Generate Secure Passwords

```bash
# Generate random password
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32
```

---

## Deployment Steps

### Step 1: Prepare Server

```bash
# Create project directory
sudo mkdir -p /opt/dataspace
cd /opt/dataspace

# Clone repository
git clone https://github.com/your-org/dataspace.git .

# Or copy files dari backup
# cp -r ./dataspace-backup/* .
```

### Step 2: Configure Environment

```bash
# Edit .env.docker-compose dengan production values
nano .env.docker-compose

# Required changes:
# - DB_PASSWORD: Change to secure password
# - REDIS_PASSWORD: Change to secure password
# - JWT_SECRET: Generate random secret
# - All URLs: Change localhost ke server IP/domain
# - VITE_API_URL: http://yourdomain.com atau http://your-server-ip
```

### Step 3: Start Services

#### Option A: Using Helper Script (Recommended)

```bash
# Make script executable
chmod +x start-docker-production.sh

# Start all services
./start-docker-production.sh start

# Monitor startup (takes 5-10 minutes on first run)
./start-docker-production.sh logs

# Check status
./start-docker-production.sh ps
```

#### Option B: Manual Docker Compose

```bash
cd /opt/dataspace/infra/docker

# Start with output visible
docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  up --build

# Or start in background
docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  up --build -d
```

### Step 4: Verify Services Are Running

```bash
# Check all containers
docker-compose ps

# Expected output: All services showing "Up" status with green health check

# Check specific service
docker-compose logs -f idp
docker-compose logs -f postgres

# Test health endpoints
curl http://localhost:3000/health  # IDP
curl http://localhost:3001/health  # Broker
curl http://localhost:5174         # Frontend (should return HTML)
```

### Step 5: Initialize Database

Database akan **otomatis** diinisialisasi saat PostgreSQL container start karena:
- SQL scripts ada di: `db/init/`
- Docker mount folder ini ke: `/docker-entrypoint-initdb.d`
- PostgreSQL menjalankan semua `.sql` files saat initialization

```bash
# Verify database initialized
docker-compose exec postgres psql -U postgres -d dataspace_prod -c "\dt"

# Expected: List of all tables (participants, datasets, schemas, etc)
```

---

## Common Operations

### View Logs

```bash
# All services
./start-docker-production.sh logs

# Specific service
./start-docker-production.sh logs idp
./start-docker-production.sh logs postgres
./start-docker-production.sh logs broker

# Last 100 lines only
docker-compose logs --tail=100 idp
```

### Restart Services

```bash
# Restart all
./start-docker-production.sh restart

# Restart specific service
docker-compose restart idp

# Stop all (keep containers)
./start-docker-production.sh stop

# Stop and remove containers (keep data)
./start-docker-production.sh down
```

### Database Management

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d dataspace_prod

# Common psql commands:
# \dt              - List all tables
# \d table_name    - Describe table
# SELECT * FROM participants;  - Query data
# \q               - Quit

# Backup database
docker-compose exec postgres pg_dump -U postgres dataspace_prod > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

### Scale Services

Jika ingin increase replicas untuk load balancing:

```bash
# Check current
docker-compose ps idp

# Scale IDP service to 3 replicas
docker-compose up -d --scale idp=3

# View all replicas
docker-compose ps idp
```

---

## Monitoring & Health Checks

### Service Health

```bash
# Check all health status
docker-compose ps

# Manual health check
curl -f http://localhost:3000/health || echo "IDP unhealthy"
curl -f http://localhost:3001/health || echo "Broker unhealthy"

# Check container resource usage
docker stats

# Monitor logs for errors
docker-compose logs | grep -i error
```

### Disk Space

```bash
# Check Docker disk usage
docker system df

# Check filesystem
df -h

# If running low, cleanup unused images
docker system prune -a
```

### Database Health

```bash
# Check if database is responding
docker-compose exec postgres pg_isready -U postgres

# Check connection status
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM participants;"
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs idp

# Common issues:
# - Port already in use: Change port mapping in docker-compose.yml
# - Dockerfile.service not found: Verify file exists at infra/docker/Dockerfile.service
# - Image build failed: Check npm install logs

# Rebuild image
docker-compose build --no-cache idp
docker-compose up -d idp
```

### Database Connection Failed

```bash
# Check if postgres is healthy
docker-compose exec postgres pg_isready -U postgres

# Check postgres logs
docker-compose logs postgres

# Verify environment variables
grep DB_ .env.docker-compose

# Restart database
docker-compose restart postgres
docker-compose up -d
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Reduce memory limit in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 1G  # Reduce from 512M

# Or restart services
docker-compose restart
```

### Port Conflicts

```bash
# Find what's using a port
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>    # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port mapping in docker-compose.yml
```

### npm Install Failed

```bash
# Clear npm cache
docker-compose exec idp npm cache clean --force

# Rebuild service
docker-compose build --no-cache idp

# Check pnpm lock file exists
ls pnpm-lock.yaml  # Should exist in root
```

---

## Production Best Practices

### 1. Security

```bash
# Use strong passwords
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 32)

# Update .env.docker-compose with these values

# Never commit .env to git
echo ".env.docker-compose" >> .gitignore

# Use SSL/TLS for external access
# Configure Traefik with valid SSL certificate
```

### 2. Backups

```bash
# Daily database backup script
# Create: /opt/dataspace/backup.sh

#!/bin/bash
BACKUP_DIR="/opt/dataspace/backups"
mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U postgres dataspace_prod | \
  gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schedule with cron
# 0 2 * * * /opt/dataspace/backup.sh  (daily at 2 AM)
```

### 3. Monitoring

```bash
# Install monitoring tools
# Option 1: Prometheus + Grafana
# Option 2: Datadog
# Option 3: New Relic

# Configure health check endpoints
# All services have /health endpoint
```

### 4. Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild services
docker-compose build --no-cache

# Update with zero downtime (Traefik will handle)
docker-compose up -d

# Rollback jika ada issue
docker-compose down
git checkout HEAD~1  # Go back to previous version
docker-compose up -d
```

### 5. Logging

```bash
# Configure log rotation (already configured)
# logging:
#   driver: "json-file"
#   options:
#     max-size: "100m"
#     max-file: "10"

# View aggregated logs
docker-compose logs --timestamps | tail -100
```

---

## Accessing Services

| Service | URL | Port | Notes |
|---------|-----|------|-------|
| Frontend | http://yourdomain.com | 80/443 | Via Traefik |
| API Gateway | http://yourdomain.com/api/* | 80/443 | Via Traefik |
| Kafka UI | http://yourdomain.com:8080 | 8080 | Kafka management |
| Adminer | http://yourdomain.com:8080 | 8080 | Database management |

---

## Environment Variables Reference

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=dataspace_prod
DB_USER=postgres
DB_PASSWORD=<secure_password>
DB_MAX_CONNECTIONS=50

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<secure_password>

# Kafka
KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=dataspace-prod

# Application
NODE_ENV=production
LOG_LEVEL=info

# Security
JWT_SECRET=<random_string>
JWT_EXPIRY=24h

# Service URLs
IDP_URL=http://idp:3000
BROKER_URL=http://broker:3001
HUB_URL=http://hub:3002
# ... (11 total services)
```

---

## Control Script Usage

```bash
# Start
./start-docker-production.sh start

# Stop
./start-docker-production.sh stop

# Restart
./start-docker-production.sh restart

# View logs
./start-docker-production.sh logs
./start-docker-production.sh logs idp

# Show status
./start-docker-production.sh ps

# Pull latest images
./start-docker-production.sh pull

# Health check
./start-docker-production.sh health

# Cleanup
./start-docker-production.sh clean
```

---

## First Run Checklist

- [ ] Docker & Docker Compose installed
- [ ] Repository cloned to `/opt/dataspace`
- [ ] `.env.docker-compose` updated with secure passwords
- [ ] All URLs updated to server IP/domain
- [ ] Port 80, 443, 3000-3011, 5174 available
- [ ] 16GB+ RAM available
- [ ] 50GB+ disk space available
- [ ] Run: `./start-docker-production.sh start`
- [ ] Wait 5-10 minutes for full startup
- [ ] Verify: `./start-docker-production.sh ps`
- [ ] Test: `curl http://localhost:3000/health`
- [ ] Access frontend: http://yourdomain.com

---

## Getting Help

```bash
# View service logs
docker-compose logs -f [service_name]

# Check container health
docker inspect [container_id]

# See all docker processes
docker ps -a

# Debug network
docker network inspect dataspace-net

# Restart everything
docker-compose restart
```

---

## Summary

✅ **Database**: Automatically initialized via SQL scripts
✅ **npm Dependencies**: Installed during Docker build
✅ **Services**: All 11 microservices ready to run
✅ **Frontend**: Built and served via Traefik
✅ **Health Checks**: Configured for all services
✅ **Monitoring**: Logging configured for all containers
✅ **Production Ready**: All configs optimized for production

🚀 **You're ready to deploy!**

