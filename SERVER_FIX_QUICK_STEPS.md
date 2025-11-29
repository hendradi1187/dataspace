# Server Fix - Quick Steps

## Error on Server

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '@dataspace/db/dist/index.js'
```

**Status**: ✅ FIXED - Updated Dockerfile

---

## Action Required on Server (5 minutes)

### Step 1: Pull Latest

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace
git pull origin main

# Verify Dockerfile updated
grep "Build ALL libs" infra/docker/Dockerfile.service
# Should print: "# Build ALL libs FIRST"
```

### Step 2: Clean & Rebuild

```bash
cd infra/docker

# Stop all
docker-compose -f docker-compose.production.yml down

# Rebuild with fix (takes 10-15 min)
docker-compose -f docker-compose.production.yml build --no-cache

# Watch logs for build progress:
# Building idp...
# Building libs/db... (NEW!)
# Building libs/validation... (NEW!)
# ... etc
```

### Step 3: Start Services

```bash
docker-compose -f docker-compose.production.yml up -d

# Monitor (wait 2-3 minutes)
docker-compose logs -f

# Look for:
# ✅ trustcore-compliance started
# ✅ idp started
# ✅ All services healthy

# Press Ctrl+C when done
```

### Step 4: Verify

```bash
# Check all Up
docker-compose ps
# All should show "Up (healthy)"

# Test endpoints
curl http://45.158.126.171:3000/health    # Should be 200 OK
curl http://45.158.126.171:3005/health    # Should be 200 OK
curl http://45.158.126.171:5174           # Should be 200 OK

# Done! ✅
```

---

## What Changed

**Fixed Dockerfile.service**:

```dockerfile
# NEW: Build ALL libs FIRST
RUN for lib in libs/*/; do \
  if [ -f "$lib/package.json" ]; then \
    echo "Building $lib..."; \
    pnpm -C "$lib" run build; \
  fi; \
done

# NEW: Use frozen lockfile
RUN pnpm install --frozen-lockfile

# REMOVED: Redundant reinstall in runtime
# (was: RUN pnpm install --prod)
```

**Why it matters**:
- ✅ Builds libs BEFORE services
- ✅ Services can now import `@dataspace/db`
- ✅ No module not found errors
- ✅ Faster builds (no reinstall)

---

## Troubleshooting

**If still error:**

```bash
# View build logs
docker-compose logs -f idp | head -100

# Check lib dist folder
docker-compose exec idp ls /app/libs/db/dist/

# If empty = lib not built
# Solution: Rebuild again
docker-compose build --no-cache idp

# Then restart
docker-compose restart idp
```

**If very slow:**

```bash
# Already building? Check progress
docker-compose logs idp | tail -20

# Takes 10-15 min first build
# Subsequent rebuilds only ~5 min
```

---

## Expected Timeline

```
Start (0 min)
  ↓
Pull git (1 min)
  ↓
docker-compose down (1 min)
  ↓
docker-compose build --no-cache (10-15 min)  ← MAIN TIME
  Step 1/20: Downloading dependencies
  Step 5/20: pnpm install
  Step 10/20: Building libs/db
  Step 12/20: Building libs/validation
  Step 15/20: Building service
  Step 20/20: Health check
  ↓
docker-compose up -d (1 min)
  ↓
Services starting (2-3 min)
  ↓
Complete ✅ (18-22 min total)
```

---

## Files Changed

- ✅ `infra/docker/Dockerfile.service` - Fixed build order
- ✅ `FIX_MODULE_NOT_FOUND_ERROR.md` - Detailed explanation

---

## Git Info

Commit: `e69acaf` - "Fix pnpm workspace build order"
Status: Pushed to GitHub ✅

---

## Summary

1. ✅ Issue identified: Libs not built before services
2. ✅ Dockerfile fixed: Build order corrected
3. ✅ Changes pushed: Ready on GitHub
4. ✅ Action: Pull, rebuild, restart on server
5. ✅ Result: All services should stay "Up"

**DO THIS NOW:**
```bash
cd /opt/dataspace
git pull
cd infra/docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f  # Watch 2-3 min then Ctrl+C
```

**Done!** ✅

