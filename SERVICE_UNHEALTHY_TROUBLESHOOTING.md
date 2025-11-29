# Service Unhealthy - Complete Troubleshooting Guide

## Current Error
```
ERROR: for idp  Container "c3814710e76f" is unhealthy.
ERROR: Encountered errors while bringing up the project.
```

Services are starting but failing health checks. Let's diagnose and fix.

---

## Step 1: Get Detailed Logs

### View IDP Service Logs (Most Important)
```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

# See recent logs
docker-compose -f docker-compose.production.yml logs idp --tail=100

# Or get more detailed view
docker logs $(docker ps -aq -f "name=idp") 2>&1 | tail -100
```

**REPORT WHAT YOU SEE** - This is key to fixing the issue.

---

## Step 2: Check Dependencies

### Is Database Ready?
```bash
docker-compose -f docker-compose.production.yml ps postgres
# Should show: Up (healthy)
```

### Is Redis Ready?
```bash
docker-compose -f docker-compose.production.yml ps redis
# Should show: Up (healthy)
```

### Is Kafka Ready?
```bash
docker-compose -f docker-compose.production.yml ps kafka
# Should show: Up (healthy)
```

---

## Step 3: Check Service Directly

### Try Running Service Manually
```bash
# Get into the container
docker-compose -f docker-compose.production.yml exec idp sh

# Inside container, try to run the service
cd /app
node services/cts/idp/dist/index.js

# Watch output for errors
```

### Check if Workspace Symlinks Exist
```bash
docker-compose -f docker-compose.production.yml exec idp ls -la /app/node_modules/@dataspace/
# Should show links to libs/db, libs/validation, etc.
```

### Check if Service Can Load
```bash
docker-compose -f docker-compose.production.yml exec idp node -e "import('@dataspace/db').then(m => console.log('OK')).catch(e => console.error('ERROR:', e.message))"
```

---

## Likely Issues & Solutions

### Issue 1: Database Not Ready / Connection Failed

**Symptoms:**
- Logs show "Connection refused" or "ECONNREFUSED"
- Service keeps restarting

**Solution:**
```bash
# Wait for database to be fully ready
docker-compose -f docker-compose.production.yml ps postgres
# Wait until it shows "Up (healthy)" - may take 30-60 seconds

# Then try again
docker-compose -f docker-compose.production.yml up -d
```

**Alternative - Initialize Database Manually:**
```bash
# Check if schema exists
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d dataspace_prod -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# If no tables, run init scripts
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d dataspace_prod < /docker-entrypoint-initdb.d/01-schema.sql
```

---

### Issue 2: Module Import Error

**Symptoms:**
- Logs show "Cannot find module '@dataspace/db'"
- "ERR_MODULE_NOT_FOUND"

**Solution:**
```bash
# Check workspace symlinks
docker-compose -f docker-compose.production.yml exec idp ls -la /app/node_modules/@dataspace/

# If missing, create them manually
docker-compose -f docker-compose.production.yml exec idp bash -c "
  for lib in db validation clients messages; do
    ln -sf ../../libs/\$lib /app/node_modules/@dataspace/\$lib
  done
  ls -la /app/node_modules/@dataspace/
"

# Or rebuild with fresh Docker build
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

### Issue 3: Health Check Failing But Service Actually Works

**Symptoms:**
- Logs show service started successfully
- But health check curl fails
- Container marked unhealthy

**Solution:**
```bash
# Test health endpoint manually
docker-compose -f docker-compose.production.yml exec idp curl http://localhost:3000/health

# If it works, the issue is timing
# Increase health check start_period even more

# Edit docker-compose.production.yml:
# Change start_period from 45s to 60s or 90s
```

---

### Issue 4: Service Code Has Errors

**Symptoms:**
- Service starts but immediately crashes
- Logs show TypeError or other JavaScript errors
- Exit code 1

**Solution:**
```bash
# View full service logs
docker-compose -f docker-compose.production.yml logs idp --tail=200

# Look for stack traces
# Report error to development team

# Try to get into container and test
docker-compose -f docker-compose.production.yml exec idp node services/cts/idp/dist/index.js
# See what the actual error is
```

---

## Quick Diagnostic Commands

Run these in order to diagnose:

```bash
#!/bin/bash
cd /opt/dataspace/infra/docker

echo "1. Service Status:"
docker-compose -f docker-compose.production.yml ps idp

echo ""
echo "2. Service Logs (last 50 lines):"
docker-compose -f docker-compose.production.yml logs idp --tail=50

echo ""
echo "3. Dependency Status:"
echo "Database:"
docker-compose -f docker-compose.production.yml ps postgres
echo "Redis:"
docker-compose -f docker-compose.production.yml ps redis

echo ""
echo "4. Workspace Symlinks:"
docker-compose -f docker-compose.production.yml exec idp ls -la /app/node_modules/@dataspace/ 2>/dev/null || echo "Cannot access container"

echo ""
echo "5. Test Health Endpoint:"
docker-compose -f docker-compose.production.yml exec idp curl -s http://localhost:3000/health 2>/dev/null || echo "Health check not responding"
```

---

## Next Actions

1. **Collect Logs** - Run the diagnostic commands above
2. **Share Output** - Copy the error messages
3. **We'll Fix** - Based on the actual error, we can apply the correct fix

---

## Common Fixes to Try Immediately

### Fix 1: Wait for Database
```bash
# Sometimes postgres just needs more time
docker-compose -f docker-compose.production.yml down
sleep 30
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml logs -f
# Wait 2-3 minutes
```

### Fix 2: Full Rebuild
```bash
docker-compose -f docker-compose.production.yml down -v
docker image rm dataspace-idp:latest dataspace-broker:latest dataspace-hub:latest
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml logs -f
```

### Fix 3: Increase Health Check Timeout
```bash
# Edit infra/docker/docker-compose.production.yml
# Find all: start_period: 45s
# Change to: start_period: 90s

# Redeploy:
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

---

## Still Not Working?

If none of the above works:

1. Get full logs from all services:
   ```bash
   docker-compose -f docker-compose.production.yml logs > /tmp/docker-logs.txt
   ```

2. Share the contents of `/tmp/docker-logs.txt`

3. We'll provide a targeted fix based on the actual error messages

---

**The key is getting the actual error message from the logs.**
**Share what you see and we'll fix it!**

