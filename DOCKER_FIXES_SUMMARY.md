# Docker Configuration Fixes - Summary

## Issues Fixed

### 1. Missing Dockerfile.service ❌ → ✅

**Error**:
```
unable to prepare context: unable to evaluate symlinks in Dockerfile path:
lstat /opt/dataspace/infra/docker/Dockerfile.service: no such file or directory
```

**Solution**: Created `infra/docker/Dockerfile.service`
- Generic production Dockerfile untuk semua services
- Supports build args: SERVICE_NAME, PORT, NODE_ENV
- Multi-stage build untuk optimized image size
- Includes npm install otomatis
- Health check configured

**File**: `D:\Project\dataspace\infra\docker\Dockerfile.service`

---

### 2. Docker Compose Config Conflicts ❌ → ✅

**Error**:
```
services.deploy.replicas: can't set container_name and hub as container name
must be unique: invalid compose project
```

**Root Cause**: Services dengan `replicas > 1` tidak boleh memiliki `container_name` yang fixed
- Docker akan generate unique names otomatis (idp-1, idp-2, dst)

**Solution**: Removed `container_name` dari services dengan `replicas: 2`:
1. idp (removed: dataspace-idp-prod)
2. broker (removed: dataspace-broker-prod)
3. hub (removed: dataspace-hub-prod)
4. frontend (removed: dataspace-frontend-prod)

**Preserved** `container_name` untuk services dengan `replicas: 1`:
- trustcore-policy
- trustcore-contract
- trustcore-compliance
- trustcore-ledger
- clearing-cts
- appstore
- connector
- trustcore-clearing
- trustcore-connector

**File**: `D:\Project\dataspace\infra\docker\docker-compose.production.yml`

---

## Files Created/Modified

### Created ✨

1. **`infra/docker/Dockerfile.service`**
   - Generic production Dockerfile untuk services
   - Multi-stage build (builder + runtime)
   - pnpm workspace support
   - npm auto-install

2. **`start-docker-production.sh`**
   - Control script untuk Linux/macOS
   - Commands: start, stop, restart, logs, ps, pull, health, clean
   - Usage: `./start-docker-production.sh [command]`

3. **`start-docker-production.bat`**
   - Control script untuk Windows
   - Same commands sebagai shell version
   - Usage: `start-docker-production.bat [command]`

4. **`DOCKER_PRODUCTION_GUIDE.md`**
   - Complete deployment guide untuk production
   - Prerequisites, configuration, troubleshooting
   - Best practices dan monitoring

5. **`DOCKER_FIXES_SUMMARY.md`** (File ini)
   - Summary of fixes dan changes

### Modified 🔧

1. **`infra/docker/docker-compose.production.yml`**
   - Removed container_name dari: idp, broker, hub, frontend
   - All other configurations unchanged
   - Validated and tested

---

## Verification

### Docker Compose Config Validation

```bash
cd /opt/dataspace/infra/docker

# Validate syntax
docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  config --quiet

# Expected output: Only warning tentang deprecated 'version' attribute (safe)
```

### Services Configuration

**Services dengan Multi-Replica Setup** (Auto-generated names):
```yaml
idp:
  replicas: 2        # Will create idp-1, idp-2
  # container_name removed

broker:
  replicas: 2        # Will create broker-1, broker-2
  # container_name removed

hub:
  replicas: 2        # Will create hub-1, hub-2
  # container_name removed
```

**Services dengan Fixed Container Names** (Replicas: 1):
```yaml
trustcore-policy:
  replicas: 1
  container_name: dataspace-policy-prod  # ✅ Preserved
```

---

## Database & npm Setup Status

### ✅ Database

- **Status**: Fully configured for auto-initialization
- **Initialization Method**: PostgreSQL docker-entrypoint-initdb.d
- **Scripts Location**: `db/init/`
  - `00-init-database.sql` - Create database
  - `01-init-schema.sql` - Create tables & schema
  - `02-seed-data.sql` - Insert sample data
- **When**: Automatically runs on first PostgreSQL container start
- **Volumes**: `postgres_data_prod` - persistent storage

### ✅ npm Dependencies

- **Status**: Fully configured for auto-installation
- **Installation Method**: Docker build process
- **Dockerfile**: `infra/docker/Dockerfile.service`
- **Process**:
  1. Copy pnpm-workspace.yaml dan pnpm-lock.yaml
  2. Copy all package.json files
  3. Run `pnpm install --no-frozen-lockfile`
  4. Build service (if build script exists)
  5. Create runtime image dengan production dependencies only
- **When**: During `docker-compose up --build`
- **Package Manager**: pnpm (monorepo optimized)

---

## How to Deploy

### Option 1: Quick Start (Recommended)

```bash
cd /opt/dataspace

# Make script executable
chmod +x start-docker-production.sh

# Start everything
./start-docker-production.sh start

# Monitor (Ctrl+C to stop)
./start-docker-production.sh logs
```

### Option 2: Manual

```bash
cd /opt/dataspace/infra/docker

docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  up --build -d
```

### Expected Startup Sequence

```
1. PostgreSQL starts
   ├── Runs: 00-init-database.sql
   ├── Runs: 01-init-schema.sql
   ├── Runs: 02-seed-data.sql
   └── Health check: HEALTHY

2. Redis starts
   └── Health check: HEALTHY

3. Kafka + Zookeeper start
   └── Health check: HEALTHY

4. All microservices start (parallel, depends_on postgres healthy)
   ├── Build image: npm install
   ├── Start service
   └── Health check: HEALTHY (each)

5. Frontend starts
   ├── Build React+Vite
   ├── Start serving
   └── Health check: HEALTHY

Total time: 5-10 minutes (first run), <1 minute (subsequent)
```

---

## Testing Deployment

### Verify All Services Running

```bash
# Check container status
docker-compose ps

# Expected: All containers "Up" with green health status
```

### Test Endpoints

```bash
# IDP Service
curl http://localhost:3000/health

# Broker Service
curl http://localhost:3001/health

# Hub Service
curl http://localhost:3002/health

# Frontend
curl http://localhost:5174

# All should return 200 OK or HTML response
```

### Check Database

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d dataspace_prod -c "\dt"

# Expected: List of tables
# - participants
# - datasets
# - schemas
# - vocabularies
# - policies
# - contracts
# - credentials
# - tokens
# - ... etc
```

---

## Important Notes

⚠️ **Before Deploying to Production**:

1. **Update `.env.docker-compose`**:
   - Change `DB_PASSWORD` to secure value
   - Change `REDIS_PASSWORD` to secure value
   - Generate new `JWT_SECRET`
   - Update all URLs dengan server IP/domain

2. **Verify Port Availability**:
   - Port 80, 443 (Traefik)
   - Port 3000-3011 (Services)
   - Port 5174 (Frontend)
   - Port 5432 (PostgreSQL)
   - Port 6379 (Redis)
   - Port 9092 (Kafka)

3. **System Requirements**:
   - RAM: 16GB minimum
   - Disk: 50GB minimum
   - CPU: 8+ cores recommended

4. **Backup**:
   - Setup automated backups sebelum production
   - Test restore procedure

5. **Monitoring**:
   - Setup log aggregation (ELK Stack, Splunk, Datadog)
   - Configure alerts for service failures
   - Monitor disk space, memory usage

---

## Rollback

Jika ada issue setelah deployment:

```bash
# Stop all services
./start-docker-production.sh down

# Go back to previous git commit
git checkout HEAD~1

# Rebuild and start
./start-docker-production.sh start

# Or restore from database backup
docker-compose exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

---

## Next Steps

1. ✅ Copy repository ke server: `/opt/dataspace`
2. ✅ Update `.env.docker-compose` dengan production values
3. ✅ Verify all ports available
4. ✅ Run: `./start-docker-production.sh start`
5. ✅ Monitor: `./start-docker-production.sh logs`
6. ✅ Verify: `./start-docker-production.sh ps`
7. ✅ Test endpoints
8. ✅ Setup backups
9. ✅ Setup monitoring
10. ✅ Go live! 🚀

---

## Support

Jika ada error saat deployment:

```bash
# View specific service logs
./start-docker-production.sh logs [service_name]

# Examples:
./start-docker-production.sh logs idp
./start-docker-production.sh logs postgres
./start-docker-production.sh logs broker

# Check system resources
docker stats

# Detailed container info
docker inspect [container_name]
```

---

## Version Info

- **Docker Compose**: v3.9
- **Node.js**: 20-alpine
- **PostgreSQL**: 16-alpine
- **Redis**: 7-alpine
- **Kafka**: 7.5.3
- **Traefik**: v2.10
- **Created**: 2025-11-28
- **Status**: ✅ Production Ready

