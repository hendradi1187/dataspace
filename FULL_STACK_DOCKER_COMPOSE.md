# Full Stack Docker Compose Setup Guide

## Overview

Panduan lengkap untuk menjalankan **seluruh aplikasi Dataspace** dengan Docker Compose, termasuk:

- ✅ Frontend (Port 5174)
- ✅ Database (PostgreSQL)
- ✅ Cache (Redis)
- ✅ Message Queue (Kafka + Zookeeper)
- ✅ 11 Microservices (Ports 3000-3011)
- ✅ Admin tools (Adminer, Kafka UI)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose Network                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐     ┌──────────────────┐          │
│  │  Frontend (5174) │     │ Microservices    │          │
│  │  React + Vite    │────▶│ (Ports 3000-3011)│          │
│  └──────────────────┘     └──────────────────┘          │
│         │                           │                    │
│         ├──────────┬────────────────┤                    │
│         │          │                │                    │
│         ▼          ▼                ▼                    │
│    ┌─────────┐ ┌───────┐    ┌──────────┐               │
│    │  Postgres│ │ Redis │    │  Kafka   │               │
│    │  :5432   │ │ :6379 │    │ :9092    │               │
│    └─────────┘ └───────┘    └──────────┘               │
│                                   │                     │
│                                   ▼                     │
│                            ┌──────────────┐            │
│                            │  Zookeeper   │            │
│                            │  :2181       │            │
│                            └──────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements
- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **RAM**: Minimal 8GB (16GB recommended)
- **Disk Space**: 20GB free
- **CPU**: 4+ cores recommended

### Installation
```bash
# Windows (using Docker Desktop)
# Download from: https://www.docker.com/products/docker-desktop

# Linux
sudo apt-get install docker.io docker-compose

# macOS
brew install docker docker-compose
```

### Verify Installation
```bash
docker --version
docker-compose --version
```

---

## Quick Start

### Option 1: Using Startup Script (Recommended)

#### Windows:
```powershell
# From project root
.\start-docker-compose.bat

# Or with specific command
.\start-docker-compose.bat start    # Start all
.\start-docker-compose.bat logs     # View logs
.\start-docker-compose.bat ps       # Show status
```

#### Linux/macOS:
```bash
# Make executable
chmod +x start-docker-compose.sh

# Run
./start-docker-compose.sh start     # Start all
./start-docker-compose.sh logs      # View logs
./start-docker-compose.sh ps        # Show status
```

### Option 2: Manual Docker Compose Commands

```bash
# Navigate to docker directory
cd infra/docker

# Start full stack
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up --build

# Or in background
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up --build -d
```

---

## Services & Ports

### Frontend
| Service | Port | Type | URL |
|---------|------|------|-----|
| Frontend | 5174 | HTTP | http://localhost:5174 |

### Microservices
| Service | Port | Name |
|---------|------|------|
| IDP (Identity Provider) | 3000 | idp |
| Broker | 3001 | broker |
| Hub | 3002 | hub |
| Policy (TrustCore) | 3003 | trustcore-policy |
| Contract (TrustCore) | 3004 | trustcore-contract |
| Compliance (TrustCore) | 3005 | trustcore-compliance |
| Ledger (TrustCore) | 3006 | trustcore-ledger |
| Clearing (CTS) | 3007 | clearing-cts |
| AppStore | 3008 | appstore |
| Connector | 3009 | connector |
| Clearing (TrustCore) | 3010 | trustcore-clearing |
| Connector (TrustCore) | 3011 | trustcore-connector |

### Infrastructure
| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache |
| Zookeeper | 2181 | localhost:2181 | Kafka coordination |
| Kafka | 9092 | localhost:9092 | Message broker |
| Adminer | 8080 | http://localhost:8080 | DB management |

---

## Configuration Files

### `.env.docker-compose`
Environment variables untuk Docker Compose. Gunakan **internal service names** untuk komunikasi antar container:

```bash
# Internal service URLs (within Docker network)
IDP_URL=http://idp:3000
BROKER_URL=http://broker:3001
HUB_URL=http://hub:3002
# ... dll

# For production (external IP), update ini:
# IDP_URL=http://45.158.126.171:3000
# BROKER_URL=http://45.158.126.171:3001
```

### `docker-compose.yml`
Definisi seluruh services. Located at: `infra/docker/docker-compose.yml`

### `docker-compose.dev.5174.yml`
Override configuration untuk frontend port 5174. Located at: `infra/docker/docker-compose.dev.5174.yml`

---

## Usage Commands

### Start Services
```bash
# Start in foreground (see logs in real-time)
cd infra/docker
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up

# Start in background
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up -d

# Start with rebuild
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f idp
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs -f --tail=50
```

### Check Status
```bash
# List all containers
docker-compose ps

# Health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Stop Services
```bash
# Stop (keep data)
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v

# Stop specific service
docker-compose stop frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart idp
```

### Execute Commands
```bash
# Get shell in container
docker-compose exec postgres bash
docker-compose exec frontend sh

# Run one-off command
docker-compose exec idp npm run migrate
```

---

## Database Management

### Using Adminer (Web UI)
1. Open: http://localhost:8080
2. Login:
   - Server: postgres
   - Username: postgres
   - Password: postgres (from .env.docker-compose)
   - Database: dataspace_prod

### Using psql (Command Line)
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d dataspace_prod

# Common commands
\dt              # List tables
\d table_name    # Describe table
SELECT * FROM table_name;  # Query data
```

### Database Backup
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres dataspace_prod > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

---

## Troubleshooting

### Ports Already in Use
```bash
# Find what's using ports
netstat -ano | findstr "5174\|3000\|5432"  # Windows
lsof -i :5174,3000,5432                   # macOS/Linux

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port mapping
# Edit docker-compose.yml:
# ports:
#   - "15174:5174"
```

### Services Not Starting
```bash
# Check logs
docker-compose logs frontend
docker-compose logs idp

# Check container status
docker-compose ps

# Restart service
docker-compose restart frontend

# Rebuild image
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose exec postgres pg_isready -U postgres

# Check postgres logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
docker-compose up -d
```

### Memory Issues
```bash
# Check resource usage
docker stats

# Limit resources in docker-compose.yml:
# resources:
#   limits:
#     cpus: '2'
#     memory: 2G
```

### DNS Resolution Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Clean and restart
docker-compose down -v
docker-compose up --build
```

---

## Performance Tuning

### Increase Resource Limits
Edit `.env.docker-compose` atau `docker-compose.yml`:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Optimize table
VACUUM ANALYZE users;
```

### Kafka Performance
```bash
# Monitor consumer lag
docker-compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group my-group \
  --describe
```

---

## Production Deployment

### For Production Server

1. **Update URLs** in `.env.docker-compose`:
```bash
# Use actual server IP instead of localhost
VITE_API_URL=http://45.158.126.171
IDP_URL=http://45.158.126.171:3000
BROKER_URL=http://45.158.126.171:3001
# ... dll
```

2. **Update Passwords**:
```bash
DB_PASSWORD=<secure_password>
REDIS_PASSWORD=<secure_password>
JWT_SECRET=<secure_random_string>
```

3. **Enable SSL/TLS**:
```bash
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

4. **Use Production Registry**:
```bash
# Build and push to registry
docker build -t your-registry/dataspace-frontend:latest .
docker push your-registry/dataspace-frontend:latest
```

5. **Deploy with Docker Stack** (Swarm):
```bash
docker stack deploy -c docker-compose.yml dataspace
```

---

## Monitoring & Health Checks

### Service Health Status
```bash
# Check all health checks
docker-compose ps

# Custom health check
curl -f http://localhost:3000/health || exit 1
```

### Logs Aggregation
```bash
# View all logs with timestamp
docker-compose logs --timestamps

# Filter logs
docker-compose logs | grep ERROR
```

### Metrics Collection
```bash
# Enable Prometheus in docker-compose.yml
# Then access: http://localhost:9090
```

---

## Cleanup & Maintenance

### Remove All Containers & Data
```bash
# Stop and remove everything
docker-compose down -v

# Remove unused resources
docker system prune -a --volumes
```

### Update Images
```bash
# Pull latest images
docker-compose pull

# Rebuild locally
docker-compose build --no-cache

# Start with new images
docker-compose up -d
```

### View Disk Usage
```bash
docker system df
docker system df -v
```

---

## Advanced: Custom Configuration

### Override Compose File
```bash
# Use multiple compose files
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.override.yml \
  -f docker-compose.prod.yml \
  up
```

### Network Management
```bash
# List networks
docker network ls

# Inspect network
docker network inspect dataspace-net

# Connect container to network
docker network connect dataspace-net container_name
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect dataspace-postgres

# Backup volume
docker run --rm -v dataspace-postgres:/data -v $(pwd):/backup \
  busybox tar czf /backup/postgres.tar.gz -C /data .
```

---

## Files Structure

```
D:/BMAD-METHOD/dataspace/
├── .env.docker-compose          # Docker Compose env variables
├── .env.production               # Production env variables
├── start-docker-compose.sh       # Startup script (Linux/macOS)
├── start-docker-compose.bat      # Startup script (Windows)
├── FULL_STACK_DOCKER_COMPOSE.md  # This file
│
├── infra/docker/
│   ├── docker-compose.yml        # Main compose config
│   ├── docker-compose.dev.5174.yml # Frontend override
│   ├── Dockerfile.service        # Service Dockerfile
│   ├── traefik/                  # Reverse proxy config
│   └── ...other configs
│
├── apps/
│   └── frontend/
│       ├── Dockerfile            # Production build
│       ├── vite.config.ts        # Frontend config
│       └── src/
│
├── services/
│   └── cts/                      # Microservices
│       ├── idp/
│       ├── broker/
│       ├── hub/
│       └── ...
│
└── database/
    └── migrations/               # DB schema
```

---

## Getting Help

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Check Container Health
```bash
docker-compose ps
docker inspect [container_id]
```

### Common Issues & Solutions
See: `TROUBLESHOOTING.md` (if exists) or above section

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)

---

## Summary

✅ **You now have:**
- Full stack running with all services
- Frontend accessible at http://localhost:5174
- Database management via Adminer
- Kafka monitoring with Kafka UI
- Easy startup/stop/restart scripts
- Comprehensive logging & monitoring

🚀 **Next Steps:**
1. Run: `./start-docker-compose.sh start`
2. Open: http://localhost:5174
3. Test all microservices
4. Deploy to production when ready
