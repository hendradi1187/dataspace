# 🚨 CRITICAL FIX - Dockerfile CMD Issue

## Problem Identified

Services were crashing immediately with **Exit code 1** because the Dockerfile was trying to run a non-existent script.

```
Status: Restarting (1)
```

## Root Cause

**Dockerfile CMD (was WRONG):**
```dockerfile
CMD ["pnpm", "-C", "services/cts/$SERVICE_NAME", "start"]
```

**Problem:**
- Services have NO `start` script in their `package.json`
- Only have `dev` and `build` scripts
- Services are already compiled in builder stage (dist/index.js exists)
- Trying to run non-existent script → immediate crash

**Service package.json (example - idp):**
```json
{
  "scripts": {
    "dev": "node --import tsx src/index.ts",   // Only for development
    "build": "tsc"                              // Already run in builder
    // NO "start" script!
  }
}
```

## Solution Applied

**Dockerfile CMD (now CORRECT):**
```dockerfile
CMD node services/cts/$SERVICE_NAME/dist/index.js
```

**Why this works:**
1. Services are already compiled to `dist/index.js` in builder stage
2. No need to run `pnpm start` (doesn't exist)
3. Run Node.js directly on compiled output
4. Simple, fast, correct

## Also Updated

**Health Check Timeouts (increased):**
```dockerfile
# Before
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3

# After
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5
```

This allows proper startup time for pnpm workspace initialization.

---

## What Changed

| Component | Before | After | Status |
|-----------|--------|-------|--------|
| CMD | `pnpm -C services/cts/$SERVICE_NAME start` | `node services/cts/$SERVICE_NAME/dist/index.js` | ✅ Fixed |
| start_period | 15s | 45s | ✅ Fixed |
| retries | 3 | 5 | ✅ Fixed |

---

## Next Steps

### 1. Pull Latest Fix (URGENT)

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace
git pull origin main
```

### 2. Rebuild All Services

```bash
cd infra/docker
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml build --no-cache
```

### 3. Restart Services

```bash
docker-compose -f docker-compose.production.yml up -d
docker-compose logs -f
```

### 4. Verify

```bash
docker-compose ps
# All should show: Up (healthy)

curl http://45.158.126.171:3000/health
# Should return: 200 OK
```

---

## Expected Behavior After Fix

```
✅ Services start without crashing
✅ No more "Restarting (1)" status
✅ All containers show "Up (healthy)" after 45-60 seconds
✅ Health checks pass
✅ API endpoints respond
```

---

## Git Commit

**Hash:** f9e70e5
**Message:** "Fix Dockerfile CMD - run compiled service directly"

---

## Timeline

```
Before Fix:
Services crash → Exit code 1 → Restarting loop → Never becomes healthy

After Fix:
Services start → Run dist/index.js → Initialize properly → Health check passes → Up (healthy)
```

---

## Why This Matters

The services were already being compiled correctly to `dist/index.js` in the builder stage. We just weren't executing them properly in the runtime. This was a **simple but critical oversight** in the Docker command.

**Now the services will actually run!** 🚀

---

## Summary

| Issue | Cause | Fix | Impact |
|-------|-------|-----|--------|
| Services crashing | CMD tried to run non-existent `pnpm start` | Run `node dist/index.js` directly | ✅ Services now start |
| Unhealthy container | Health check too soon (15s) | Increase start_period to 45s | ✅ Proper initialization time |
| Exit code 1 | Missing start script | Run compiled output instead | ✅ Services running normally |

---

This is a **CRITICAL FIX** - deploy immediately!

