# 🚨 IMMEDIATE ACTION REQUIRED

## Critical Issue Found & Fixed

Your services are crashing because the Dockerfile is trying to run a script that doesn't exist.

### Issue Identified:
```
STATUS: Restarting (1)  ← All services failing
REASON: pnpm start script doesn't exist
```

### Fix Applied:
✅ **Dockerfile now runs compiled service directly**

**Before:** `pnpm -C services/cts/$SERVICE_NAME start` (CRASH)
**After:** `node services/cts/$SERVICE_NAME/dist/index.js` (WORKS)

---

## Deploy Now (3 Steps)

### Step 1: Pull Latest (1 min)
```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace
git pull origin main

# Verify fix
grep "node services/cts" infra/docker/Dockerfile.service
# Should show: CMD node services/cts/$SERVICE_NAME/dist/index.js
```

### Step 2: Rebuild (15 min)
```bash
cd infra/docker
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml build --no-cache
```

### Step 3: Start (1 min)
```bash
docker-compose -f docker-compose.production.yml up -d
docker-compose ps

# Check status after 60 seconds
# All should show: Up (healthy) ✅
```

---

## What to Expect

### Before (Broken):
```
docker_hub_1              Restarting (1) 6 seconds ago
dataspace-broker-2        Restarting (1) 29 seconds ago
dataspace-trustcore-ledger-prod   Restarting (1) 13 seconds ago
```

### After (Fixed):
```
docker_hub_1              Up (healthy)
dataspace-broker-2        Up (healthy)
dataspace-trustcore-ledger-prod   Up (healthy)
dataspace-appstore-prod   Up (healthy)
```

---

## Verify Success

```bash
# 1. Check all containers healthy
docker-compose ps

# 2. Test endpoints
curl http://45.158.126.171:3000/health        # Should get 200 OK
curl http://45.158.126.171:3001/health        # Should get 200 OK
curl http://45.158.126.171:5174               # Should load frontend

# 3. Check logs for errors
docker-compose logs | grep -i "error"
# Should show minimal errors
```

---

## Git Commit

**Latest fix: f9e70e5**
```
Fix Dockerfile CMD - run compiled service directly
```

---

## Timeline

| Action | Time | Status |
|--------|------|--------|
| Pull latest | 1 min | ⏳ Do now |
| Build images | 15 min | ⏳ Then this |
| Start services | 1 min | ⏳ Then this |
| Verify | 2 min | ⏳ Finally check |

**Total: ~20 minutes**

---

## Summary

| What | Details |
|------|---------|
| Problem | Services crashing with exit code 1 |
| Root Cause | CMD tried to run non-existent pnpm start script |
| Fix | Run node on compiled dist/index.js directly |
| Impact | Services will now start and stay healthy |

---

## Need Help?

Read: `CRITICAL_FIX_DOCKERFILE_CMD.md`

---

**Deploy immediately!** Services won't work until this fix is applied.

