# Re-Deploy Dataspace ke Server 45.158.126.171 - Fix Guide

## Issue Yang Sudah Diperbaiki ✅

Services Anda sedang restart dengan exit code 1 karena **port binding configuration yang salah**.

### Root Cause
```yaml
❌ WRONG:
ports:
  - "45.158.126.171:3000:3000"  # Cannot bind container to external IP

✅ CORRECT:
ports:
  - "0.0.0.0:3000:3000"  # Listen on all interfaces
```

**Mengapa?** Docker containers tidak bisa bind ke external IP. Harus bind ke `0.0.0.0` (all interfaces) dan Docker otomatis forward traffic dari external IP ke container.

---

## Fixed Configuration Files ✅

Berikut file yang sudah diperbaiki dan siap untuk di-deploy:

### 1. `.env.docker-compose`
```bash
# Frontend akan mengakses API via IP server
VITE_API_URL=http://45.158.126.171
VITE_IDP_API_URL=http://45.158.126.171:3000
VITE_BROKER_API_URL=http://45.158.126.171:3001
VITE_HUB_API_URL=http://45.158.126.171:3002
# ... (12 total)

# Services akan berkomunikasi via Docker internal network
IDP_URL=http://idp:3000
BROKER_URL=http://broker:3001
# ... (internal names)
```

### 2. `infra/docker/docker-compose.production.yml`
```yaml
# ✅ FIXED - All services now use 0.0.0.0:PORT:PORT
postgres:
  ports:
    - "0.0.0.0:5432:5432"  # ✅ Fixed

redis:
  ports:
    - "0.0.0.0:6379:6379"  # ✅ Fixed

idp:
  ports:
    - "0.0.0.0:3000:3000"  # ✅ Fixed

# ... all other services
```

### 3. `apps/frontend/Dockerfile`
```dockerfile
# ✅ ADDED - Build args for all API URLs
ARG VITE_API_URL=http://45.158.126.171
ARG VITE_IDP_API_URL=http://45.158.126.171:3000
# ... (12 total)

# ✅ ADDED - Environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IDP_API_URL=$VITE_IDP_API_URL
# ... (12 total)
```

### 4. `apps/frontend/vite.config.ts`
```typescript
// ✅ CLEANED UP
// - Disabled proxy (not needed)
// - Fixed port to 5174
// - API URLs now explicit via env vars
```

---

## Deploy Steps untuk Server ⚙️

### Step 1: Transfer Updated Files ke Server

**Option A: Using SCP (if available)**
```bash
# Copy entire project
scp -r D:\Project\dataspace dt-admin@45.158.126.171:/opt/dataspace-new

# Or update specific files
scp .env.docker-compose dt-admin@45.158.126.171:/opt/dataspace/
scp -r infra/docker/docker-compose.production.yml dt-admin@45.158.126.171:/opt/dataspace/infra/docker/
```

**Option B: Using Git Pull on Server**
```bash
# SSH to server
ssh dt-admin@45.158.126.171

# Pull latest changes
cd /opt/dataspace
git pull origin main

# Verify files updated
git log --oneline | head -3
```

### Step 2: Stop Current Containers

```bash
ssh dt-admin@45.158.126.171 << 'EOF'

cd /opt/dataspace/infra/docker

# Stop all containers (keep data)
docker-compose -f docker-compose.production.yml down

# Verify all stopped
docker ps

# Expected: Empty list (no containers running)
EOF
```

### Step 3: Rebuild Images (IMPORTANT!)

```bash
ssh dt-admin@45.158.126.171 << 'EOF'

cd /opt/dataspace/infra/docker

# Rebuild ALL images with --no-cache
docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  build --no-cache

# This ensures:
# - New frontend URLs are baked in
# - Dependencies are fresh
# - No stale configuration

EOF
```

**Wait time**: 5-10 minutes

### Step 4: Start Services Fresh

```bash
ssh dt-admin@45.158.126.171 << 'EOF'

cd /opt/dataspace/infra/docker

# Start all services
docker-compose -f docker-compose.production.yml \
  --env-file ../../.env.docker-compose \
  up -d

# Check status immediately
docker-compose ps

# Watch logs
docker-compose logs -f

# Press Ctrl+C after 2-3 minutes to stop logs

EOF
```

### Step 5: Verify All Services Healthy

```bash
ssh dt-admin@45.158.126.171 << 'EOF'

cd /opt/dataspace/infra/docker

# Check container status
docker-compose ps

# Expected: ALL containers "Up" with healthy status
# ✅ dataspace-frontend      Up (healthy)
# ✅ dataspace-postgres      Up (healthy)
# ✅ dataspace-idp           Up (healthy)
# ✅ dataspace-broker        Up (healthy)
# ... all others Up

EOF
```

### Step 6: Test Endpoints

```bash
# Test from your local machine
curl http://45.158.126.171:3000/health     # IDP
curl http://45.158.126.171:3001/health     # Broker
curl http://45.158.126.171:3002/health     # Hub
curl http://45.158.126.171:5174            # Frontend (should return HTML)

# Expected: 200 OK responses
```

### Step 7: Access Frontend

```
Browser:
http://45.158.126.171:5174

Expected:
- Frontend loads successfully
- No CORS errors
- Can make API calls to backend
```

---

## Network Architecture Explanation 🏗️

### Internal Service Communication (Service ↔ Service)

```
Inside Docker Network:
┌──────────────────────────────────────────┐
│  Docker Network: dataspace-net           │
├──────────────────────────────────────────┤
│  idp ──(http://broker:3001)──> broker    │
│  frontend ─(http://idp:3000)─> idp       │
│  broker ──(http://hub:3002)──> hub       │
└──────────────────────────────────────────┘

Benefits:
- Fast (stays in Docker network)
- No external routing
- Service names auto-resolve via Docker DNS
```

### External Access (Browser → Server → Container)

```
Browser on External Machine:
http://45.158.126.171:3000
       ↓
Server Port Forwarding:
45.158.126.171:3000 → localhost:3000 (inside container)
       ↓
Container:
Listening on 0.0.0.0:3000 (accepts from all interfaces)
```

### Frontend Special Case

```
Browser:
http://45.158.126.171:5174
      ↓
Frontend JavaScript (running in browser):
Makes API calls to: http://45.158.126.171:3000
                    http://45.158.126.171:3001
                    ... (external IPs)
      ↓
Server routes to containers:
45.158.126.171:3000 → idp container
45.158.126.171:3001 → broker container
```

---

## Verification Checklist ✅

Run ini di server untuk verify semuanya OK:

```bash
#!/bin/bash

echo "=== Checking Docker Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

echo "=== Checking Port Bindings ==="
netstat -tlnp 2>/dev/null | grep -E ':(80|443|3000|3001|3002|5174|5432)'
echo ""

echo "=== Testing Health Endpoints ==="
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health > /dev/null && echo "✓ OK" || echo "✗ FAIL"
done
echo ""

echo "=== Testing Frontend ==="
echo -n "Frontend (5174): "
curl -s http://localhost:5174 | head -c 100 | grep -q "html" && echo "✓ OK" || echo "✗ FAIL"
echo ""

echo "=== Testing Database ==="
docker-compose exec postgres pg_isready -U postgres && echo "✓ Database OK" || echo "✗ Database FAIL"
```

Save as `verify-deployment.sh` dan run:
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

---

## Troubleshooting jika masih ada error ❌

### Services masih "Restarting"?

```bash
# View service logs
docker-compose logs -f idp

# Look for error messages:
# - "EADDRINUSE" = Port already in use (wrong)
# - "ECONNREFUSED" = Cannot connect to service
# - npm error = Dependency issue
```

### Connection refused dari frontend?

```bash
# Check if frontend has correct API URLs
docker-compose exec frontend env | grep VITE_

# Should show:
# VITE_API_URL=http://45.158.126.171
# VITE_IDP_API_URL=http://45.158.126.171:3000
# ... etc
```

### Port masih conflict?

```bash
# Find what's using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Need to rebuild?

```bash
# Full rebuild (take 10+ minutes)
docker-compose build --no-cache

# Or rebuild specific service
docker-compose build --no-cache idp
```

---

## Quick Command Reference 📋

```bash
cd /opt/dataspace/infra/docker

# Start all
docker-compose -f docker-compose.production.yml up -d

# Stop all
docker-compose -f docker-compose.production.yml stop

# View logs
docker-compose -f docker-compose.production.yml logs -f [service]

# Restart service
docker-compose -f docker-compose.production.yml restart idp

# Execute command in container
docker-compose -f docker-compose.production.yml exec idp pnpm start

# Remove and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

---

## Expected Results After Deployment ✅

**Before Fix** (Your current state):
```
CONTAINER ID   IMAGE                         STATUS
...
9f23906ef60c   docker_trustcore-policy       Restarting (1) 8 seconds ago ❌
5ec4edbced87   docker_trustcore-ledger       Restarting (1) 11 seconds ago ❌
693fb11b2f50   docker_connector              Restarting (1) 11 seconds ago ❌
1524fecacf5d   docker_idp                    Restarting (1) 11 seconds ago ❌
```

**After Fix** (Expected):
```
CONTAINER ID   IMAGE                         STATUS
...
50206a2017e5   docker_frontend               Up 20 seconds (health: healthy) ✅
9f23906ef60c   docker_trustcore-policy       Up 45 seconds (health: healthy) ✅
5ec4edbced87   docker_trustcore-ledger       Up 48 seconds (health: healthy) ✅
693fb11b2f50   docker_connector              Up 50 seconds (health: healthy) ✅
1524fecacf5d   docker_idp                    Up 52 seconds (health: healthy) ✅
```

---

## Key Takeaways 🎯

| ✅ DO | ❌ DON'T |
|--------|----------|
| Use `0.0.0.0:PORT:PORT` in docker-compose | Use `IP:PORT:PORT` |
| Use Docker service names internally (`http://idp:3000`) | Use external IPs internally |
| Use external IP for frontend APIs (`http://45.158.126.171:3000`) | Use localhost in production |
| Rebuild images with `--no-cache` after config changes | Reuse old images with cached config |
| Test health endpoints after deploy | Deploy blind without testing |
| Monitor logs during startup | Only check containers after full startup |

---

## Support 🆘

Jika masih ada issues setelah deployment:

1. **Check logs**:
   ```bash
   docker-compose logs -f [service_name]
   ```

2. **Check resource usage**:
   ```bash
   docker stats
   ```

3. **Verify network**:
   ```bash
   docker network inspect dataspace-net
   ```

4. **Rebuild from scratch**:
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## Summary

✅ **Port binding fixed** - Changed from `IP:PORT` to `0.0.0.0:PORT`
✅ **Frontend URLs configured** - Set to `45.158.126.171`
✅ **Internal communication preserved** - Using Docker DNS names
✅ **Ready for deployment** - All files updated and pushed to GitHub

**Next:** Copy files to server, rebuild images, restart services. Services should now stay "Up" instead of "Restarting".

