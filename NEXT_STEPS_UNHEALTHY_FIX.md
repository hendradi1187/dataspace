# Next Steps - Fix Unhealthy Containers

## What We've Done

✅ Fixed Dockerfile CMD (now runs services directly)
✅ Increased health check timeout to 60s (all services)
✅ Created comprehensive troubleshooting guides
✅ All changes pushed to GitHub

## What You Need To Do Now

### Option 1: Try Increased Timeout First (Fastest)

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

# Pull latest changes (60s timeout is now in place)
git pull origin main

# Redeploy with new config (no rebuild needed)
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Monitor for 90 seconds (services need 60s + health checks)
docker-compose logs -f
# Press Ctrl+C after services start

# Check status
docker-compose ps
# Should show: Up (healthy)
```

**If this works:** You're done! Services are healthy.

---

### Option 2: Full Rebuild (If Option 1 Doesn't Work)

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

# Pull latest
git pull origin main

# Full rebuild
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Monitor
docker-compose logs -f
# Wait 2-3 minutes

# Verify
docker-compose ps  # All Up (healthy)?
curl http://45.158.126.171:3000/health  # Works?
```

---

### Option 3: Diagnose the Real Error (If Options 1 & 2 Don't Work)

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

# Get detailed logs
docker-compose -f docker-compose.production.yml logs idp --tail=100

# Look for error messages and report them

# OR try running service manually
docker-compose -f docker-compose.production.yml exec idp sh
cd /app
node services/cts/idp/dist/index.js
# See what error you get
```

---

## Expected Results

### Successful Deployment:
```
docker-compose ps
NAME                          STATUS
dataspace-postgres-prod       Up (healthy)
dataspace-redis-prod          Up (healthy)
dataspace-idp                 Up (healthy)
dataspace-broker-1            Up (healthy)
dataspace-broker-2            Up (healthy)
dataspace-hub-1               Up (healthy)
dataspace-hub-2               Up (healthy)
...all services               Up (healthy)

curl http://45.158.126.171:3000/health
OK
```

---

## Changes Summary

| File | Change | Reason |
|------|--------|--------|
| Dockerfile.service | CMD: `node dist/index.js` | Services already compiled |
| docker-compose.production.yml | start_period: 60s | Give services time to initialize |
| docker-compose.production.yml | Port ranges | Fix port conflicts |

---

## Timeline

| Step | Time | What to Do |
|------|------|-----------|
| 1 | 1 min | Git pull |
| 2 | 2 min | docker-compose down |
| 3 | 0 min | docker-compose up (no rebuild needed) |
| 4 | 90 sec | Wait for health checks |
| 5 | 1 min | Verify status |

**Total: ~3-5 minutes**

OR with rebuild:

| Step | Time | What to Do |
|------|------|-----------|
| 1 | 1 min | Git pull |
| 2 | 2 min | docker-compose down -v |
| 3 | 15 min | docker-compose build --no-cache |
| 4 | 1 min | docker-compose up -d |
| 5 | 2 min | Wait & monitor logs |
| 6 | 1 min | Verify status |

**Total: ~22 minutes**

---

## Troubleshooting Reference

If you get errors:

- **Connection refused** → Database not ready (wait longer)
- **Cannot find module** → Workspace symlinks missing (rebuild)
- **Health check timeout** → Service still starting (wait longer, logs will show what's initializing)
- **Exit code 1** → Service code error (check logs for stack trace)

---

## Critical Files

**To understand the changes:**
- `CRITICAL_FIX_DOCKERFILE_CMD.md` - Why we changed CMD
- `SERVICE_UNHEALTHY_TROUBLESHOOTING.md` - How to diagnose
- `IMMEDIATE_ACTION_REQUIRED.md` - Quick deployment

**For detailed reference:**
- `infra/docker/Dockerfile.service` - Service build configuration
- `infra/docker/docker-compose.production.yml` - Service runtime configuration

---

## Git Commits

Latest fixes:
- `f9e70e5` - Dockerfile CMD fix
- `c6abfcd` - Critical fix documentation
- `d2dc51d` - Immediate action guide
- `f4b8452` - Troubleshooting guides
- `6a4f1c5` - Health check timeout increase (60s)

All on main branch ✅

---

## Success Criteria

You'll know it's working when:

1. ✅ `docker-compose ps` shows all "Up (healthy)"
2. ✅ No "Container is unhealthy" errors
3. ✅ `curl http://45.158.126.171:3000/health` returns 200
4. ✅ Frontend loads at `http://45.158.126.171:5174`
5. ✅ Logs show services running normally

---

## Start Now!

**Recommended:** Try Option 1 first (just pull and redeploy with 60s timeout)

If that works, you're done! 🎉

If not, move to Option 2 or Option 3.

