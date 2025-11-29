# Frontend API Errors - Complete Diagnostic Guide

## Error Message You're Seeing

```
ParticipantsService.list: Network Error
DatasetsService.list: Network Error
```

## What This Means

Frontend is trying to call:
- `http://dataspace-broker:3001/participants`
- `http://dataspace-hub:3002/datasets` (or similar)

But getting network errors = **Backend services not responding to these endpoints**

## Root Causes (In Order of Likelihood)

### 1. **Services Crashed on Startup** (Most Likely)

**Why:** Services try to connect to database during initialization
- If database isn't ready → service crashes
- Service crashes → no endpoints available
- Frontend gets network error

**Check:**
```bash
docker-compose -f infra/docker/docker-compose.production.yml ps

# Look for status - if any service shows:
# - "Restarting (1)"
# - "Exited (1)"
# - "Dead"
# Then it crashed!

# Check logs
docker-compose -f infra/docker/docker-compose.production.yml logs broker --tail=50
docker-compose -f infra/docker/docker-compose.production.yml logs hub --tail=50
```

**Solution:** Wait for database, then restart services:
```bash
# Wait for database to be healthy
docker-compose -f infra/docker/docker-compose.production.yml ps postgres
# Should show: Up (healthy)

# Restart services
docker-compose -f infra/docker/docker-compose.production.yml restart broker hub
```

---

### 2. **Database Schema Not Initialized**

**Why:** Services can't find required tables
- Database container is running
- But tables/schema don't exist yet
- Service crashes during initialization

**Check:**
```bash
# Connect to postgres
docker-compose -f infra/docker/docker-compose.production.yml exec postgres psql -U postgres -d dataspace_prod

# Inside psql, check if tables exist:
\dt
# If no output or no "participants" table → schema not initialized

# Exit
\q
```

**Solution:** Initialize schema:
```bash
# Check what init scripts exist
ls db/init/
# Should show: 01-schema.sql, 02-data.sql, etc.

# Run init scripts
docker-compose -f infra/docker/docker-compose.production.yml exec postgres bash -c "psql -U postgres -d dataspace_prod < /docker-entrypoint-initdb.d/01-schema.sql"

# Then restart services
docker-compose -f infra/docker/docker-compose.production.yml restart broker hub
```

---

### 3. **Service Health Checks Failing** (Less Likely)

**Why:** Services are running but health checks timing out
- Service started but still initializing
- Health check curl fails
- Container marked as unhealthy (might stop)

**Check:**
```bash
# See if service is actually listening
docker-compose -f infra/docker/docker-compose.production.yml exec broker curl http://localhost:3001/health

# If timeout or refused → service not listening
# If returns 200 OK → service is listening but might fail on /participants
```

**Solution:** Increase health check timeout or wait longer:
```bash
# Edit docker-compose.production.yml
# Find broker healthcheck, change:
# start_period: 60s → start_period: 90s

# Restart
docker-compose -f infra/docker/docker-compose.production.yml up -d
```

---

### 4. **Endpoints Don't Actually Exist**

**Why:** Service code doesn't register the routes
- Routes file exists
- But app.get('/participants') not called
- Frontend calls endpoint → 404 not found → Network Error

**Check:**
```bash
# Test the endpoint directly
docker-compose -f infra/docker/docker-compose.production.yml exec broker curl http://localhost:3001/participants

# If response:
# - 200 with JSON → endpoint works!
# - 404 → endpoint not registered
# - Connection refused → service not listening
```

**Solution:** Check service logs for route registration:
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs broker | grep -i "available\|endpoint\|listening"

# Should show:
# "Available endpoints:"
# "GET    /participants"
# "Broker Service running on"
```

---

## Full Diagnostic Checklist

Run these commands in order:

```bash
#!/bin/bash
cd /opt/dataspace/infra/docker

echo "1. Service Status:"
docker-compose -f docker-compose.production.yml ps | grep -E "broker|hub|idp"

echo ""
echo "2. Database Status:"
docker-compose -f docker-compose.production.yml ps postgres

echo ""
echo "3. Database Connection:"
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U postgres -d dataspace_prod

echo ""
echo "4. Check Database Schema:"
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d dataspace_prod -c "\dt"

echo ""
echo "5. Test Broker Health Endpoint:"
docker-compose -f docker-compose.production.yml exec broker curl -s http://localhost:3001/health || echo "Failed"

echo ""
echo "6. Test Participants Endpoint:"
docker-compose -f docker-compose.production.yml exec broker curl -s http://localhost:3001/participants || echo "Failed"

echo ""
echo "7. Check Broker Logs:"
docker-compose -f docker-compose.production.yml logs broker --tail=30
```

---

## Most Common Cause & Solution

**Probability: 90%**

**Problem:** Database not ready when services start

**Solution:**
```bash
cd /opt/dataspace/infra/docker

# Step 1: Wait for database
sleep 30
docker-compose -f docker-compose.production.yml ps postgres
# Wait until it shows "Up (healthy)"

# Step 2: Restart services
docker-compose -f docker-compose.production.yml restart broker hub idp

# Step 3: Wait for services
sleep 30
docker-compose -f docker-compose.production.yml ps | grep -E "broker|hub|idp"
# All should show "Up (healthy)"

# Step 4: Refresh frontend
# Go to http://45.158.126.171:5174
# Refresh the page
# Errors should be gone!
```

---

## If Services Keep Crashing

Check logs for actual error:

```bash
docker-compose -f docker-compose.production.yml logs broker --tail=100 | grep -E "error|Error|ERROR|failed|Failed|FAILED"
```

Look for patterns:
- **"Connection refused"** → Database not running
- **"relation.*does not exist"** → Schema not initialized
- **"Cannot find module"** → Workspace symlink issue
- **"EACCES"** → Permission issue
- **"listen EADDRINUSE"** → Port already in use

**Share the error message and we'll provide specific fix!**

---

## Success Indicators

When working correctly:

1. ✅ `docker-compose ps` shows all services "Up (healthy)"
2. ✅ `curl http://45.158.126.171:3001/participants` returns JSON
3. ✅ Frontend loads without Network Error messages
4. ✅ Participants/Datasets list displays in frontend
5. ✅ Can click and interact with data

---

## Quick Start - Try This First

```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace/infra/docker

# Just wait and restart
sleep 60
docker-compose -f docker-compose.production.yml restart
docker-compose -f docker-compose.production.yml logs -f

# Wait 30 seconds in logs, then Ctrl+C
# Check status
docker-compose ps

# Go to frontend and refresh
# http://45.158.126.171:5174
```

This often fixes it!

