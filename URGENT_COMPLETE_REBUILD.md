# 🚨 URGENT - Complete Clean Rebuild Required

## Current Status

All services restarting with exit code 1 because:
- ❌ Old container images still running old Dockerfile
- ❌ Frontend not even in the list (never built)
- ❌ All using old `pnpm start` command (doesn't exist)

## Root Cause

**Server is running OLD images from before we fixed the Dockerfile CMD**

The fix won't work until the images are **completely rebuilt** with the new Dockerfile.

---

## URGENT ACTION - Do This Now (20 minutes)

### Step 1: SSH to Server (1 min)

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker
```

### Step 2: Pull Latest Code (1 min)

```bash
git pull origin main

# Verify Dockerfile has our fix
grep "^CMD node services/cts" ../Dockerfile.service
# Should show: CMD node services/cts/$SERVICE_NAME/dist/index.js
```

### Step 3: Complete Clean Shutdown (2 min)

```bash
# Stop ALL containers
docker-compose -f docker-compose.production.yml down -v

# Remove ALL old images (CRITICAL!)
docker image rm -f $(docker images '*dataspace*' -q)
docker image rm -f $(docker images 'e98d28462178' -q)  # Old image

# Verify images are gone
docker images | grep dataspace
# Should show nothing
```

### Step 4: Clean Build (15 min)

```bash
# Rebuild ALL images from scratch
docker-compose -f docker-compose.production.yml build --no-cache --pull

# Watch for successful build completion
# Should show: "dataspace-idp built successfully"
#            "dataspace-broker built successfully"
#            ... etc for all services
```

### Step 5: Start Fresh (1 min)

```bash
docker-compose -f docker-compose.production.yml up -d

# Monitor logs for 2-3 minutes
docker-compose logs -f

# Press Ctrl+C when services stabilize
```

### Step 6: Verify (1 min)

```bash
# Check all containers
docker-compose ps

# Expected: All showing "Up (healthy)" or "Up (health: starting)"

# Test endpoints
curl http://45.158.126.171:3000/health         # IDP
curl http://45.158.126.171:5174                # Frontend (THIS MUST APPEAR!)

# Check images were built correctly
docker images | grep dataspace
# Should show multiple images: dataspace-idp, dataspace-broker, dataspace-frontend, etc.
```

---

## Why This Works

1. **Remove old images** → Forces complete rebuild
2. **Build --no-cache** → Doesn't use old layer cache
3. **Build --pull** → Gets latest base image
4. **New Dockerfile** → Has correct `CMD node dist/index.js`
5. **Services start** → Run compiled code directly (no pnpm)

---

## What Should Appear

After successful rebuild:

```bash
$ docker images | grep dataspace
dataspace-idp           latest    abc123def456   X minutes ago   XXX MB
dataspace-broker        latest    def456ghi789   X minutes ago   XXX MB
dataspace-hub           latest    ghi789jkl012   X minutes ago   XXX MB
dataspace-frontend      latest    jkl012mno345   X minutes ago   XXX MB
dataspace-connector     latest    mno345pqr678   X minutes ago   XXX MB
... (ALL 12+ services should be listed)
```

After startup:

```bash
$ docker-compose ps
NAME                          STATUS
dataspace-postgres-prod       Up (healthy)
dataspace-redis-prod          Up (healthy)
dataspace-broker-1            Up (healthy)
dataspace-broker-2            Up (healthy)
dataspace-hub-1               Up (healthy)
dataspace-hub-2               Up (healthy)
dataspace-frontend-1          Up (health: starting)
dataspace-frontend-2          Up (health: starting)
dataspace-idp                 Up (healthy)
... (ALL services running, no "Restarting (1)")
```

---

## Critical Checks

After rebuild, verify:

✅ **Frontend appears** - Must see dataspace-frontend containers
```bash
docker-compose ps | grep frontend
# Should show 2 frontend containers (replicas: 2)
```

✅ **All services showing correct CMD**
```bash
docker inspect dataspace-idp:latest | grep -A 10 '"Cmd"'
# Should show: "node", "services/cts/idp/dist/index.js"
# NOT: "pnpm", "-C", "services/cts/idp", "start"
```

✅ **Health checks responding**
```bash
curl http://45.158.126.171:3000/health   # IDP
curl http://45.158.126.171:3001/health   # Broker
curl http://45.158.126.171:5174          # Frontend
# All should return 200 OK or HTML
```

---

## Timeline

```
Start: 0:00
  ↓
git pull: 0:01
  ↓
docker down -v: 0:03
  ↓
docker image rm: 0:04
  ↓
docker build (15-18 min): 0:22
  ↓
docker up: 0:23
  ↓
Health checks (30-60 sec): 0:24-0:25
  ↓
Verify: 0:25

TOTAL: ~25 minutes
```

---

## If Build Fails

**Stop and report the error!**

```bash
# Get full build output
docker-compose -f docker-compose.production.yml build --no-cache 2>&1 | tail -100

# Save to file
docker-compose -f docker-compose.production.yml build --no-cache > /tmp/build.log 2>&1
cat /tmp/build.log
```

Most common build errors:
- "Cannot find module" → Workspace symlink issue (rare with new Dockerfile)
- "EACCES: permission denied" → File permission issue
- "npm ERR!" → Dependency installation issue

**Share the error output and we'll fix it.**

---

## Success Indicators

When it's working:

1. ✅ All images rebuilt (new timestamps)
2. ✅ All containers starting (no "Restarting (1)")
3. ✅ Frontend visible in docker-compose ps
4. ✅ All health checks responding
5. ✅ No error logs (or minimal errors)

---

## Summary

| What | Why | Impact |
|------|-----|--------|
| Remove old images | Force rebuild | Uses new Dockerfile |
| Build --no-cache | Skip layer cache | Complete rebuild |
| Build --pull | Latest base image | Ensures clean start |
| New CMD | Runs compiled code | Services actually work |

---

## Do NOT Skip Steps

Each step is critical:
- ❌ Don't skip image removal (won't rebuild)
- ❌ Don't skip --no-cache flag (will use old code)
- ❌ Don't skip --pull flag (may use old images)
- ❌ Don't skip verification (need to confirm it worked)

---

## Start Now!

**This is the final fix.** After this, everything should work.

Run through the 6 steps above carefully and report back the results!

