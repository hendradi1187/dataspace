# Quick Fix - All APIs Returning Network Errors

## Problem

Frontend shows Network Errors for ALL services:
```
ParticipantsService.list: Network Error
DatasetsService.list: Network Error
SchemasService.list: Network Error
VocabulariesService.list: Network Error
ConnectorsService.list: Network Error
... etc
```

## Root Cause

**ALL backend services are crashing on startup** because:
1. Database not initialized (no schema/tables)
2. Services try to connect on startup
3. Connection fails → Service crashes
4. Frontend can't reach them → Network Error

## Quick Fix (5 minutes)

### Step 1: Check Service Status

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

docker-compose -f docker-compose.production.yml ps

# Look at STATUS column for each service
# If you see:
# - "Restarting (1)"
# - "Exited (1)"
# They're crashing!
```

### Step 2: Check Database

```bash
# Is postgres healthy?
docker-compose -f docker-compose.production.yml ps postgres
# Should show: Up (healthy)

# If not healthy, wait:
sleep 30
docker-compose -f docker-compose.production.yml ps postgres
# Wait until it's healthy
```

### Step 3: Initialize Database Schema

```bash
# Check if schema exists
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d dataspace_prod -c "\dt"

# If no output or no tables, run init:
docker-compose -f docker-compose.production.yml exec postgres bash -c "ls /docker-entrypoint-initdb.d/"

# Should show SQL files like:
# 01-schema.sql
# 02-data.sql
# etc

# If files exist, run them:
docker-compose -f docker-compose.production.yml exec postgres bash -c "for f in /docker-entrypoint-initdb.d/*.sql; do echo 'Running \$f'; psql -U postgres -d dataspace_prod < \$f; done"
```

### Step 4: Restart All Services

```bash
docker-compose -f docker-compose.production.yml restart

# Wait 30 seconds
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps
# All should show: Up (health: starting) or Up (healthy)
```

### Step 5: Test

```bash
# Test one endpoint
docker-compose -f docker-compose.production.yml exec broker curl http://localhost:3001/health

# Should return: {"status":"healthy","service":"cts-broker"}

# Test with data
docker-compose -f docker-compose.production.yml exec broker curl http://localhost:3001/participants

# Should return JSON with participants list (even if empty)
```

### Step 6: Refresh Frontend

```bash
# Go to: http://45.158.126.171:5174
# Refresh the page (Ctrl+F5 or Cmd+Shift+R)
# Network errors should be gone!
```

---

## If That Doesn't Work

Check actual error in service logs:

```bash
docker-compose -f docker-compose.production.yml logs broker --tail=100 | grep -i "error\|failed\|connection"

# Share what error you see
```

Common errors:
- **"relation.*does not exist"** → Run schema initialization (Step 3)
- **"Connection refused"** → Database not ready (wait longer)
- **"EACCES"** → Permission issue (less common)

---

## Expected Result

After fix, refresh frontend and you should see:

✅ Participants list loads
✅ Datasets list loads
✅ Schemas/Vocabularies appear
✅ No Network Error messages
✅ Can interact with data

---

## Summary

1. Database probably not initialized → Run SQL init scripts
2. Services probably crashed → Will auto-restart once DB is ready
3. Frontend should then work → Just need to refresh

This should take **5 minutes** and fix the issue!

