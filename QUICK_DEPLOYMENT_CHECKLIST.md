# Quick Deployment Checklist - Server 45.158.126.171

## ✅ Pre-Deployment Verification (Local)

- [ ] Verify all changes are saved:
  - `.env.docker-compose` - Contains server IP environment variables
  - `infra/docker/docker-compose.production.yml` - Port bindings use `0.0.0.0:PORT:PORT`
  - `apps/frontend/Dockerfile` - Has all VITE_*_API_URL variables

- [ ] Check docker-compose syntax:
  ```bash
  docker-compose -f infra/docker/docker-compose.production.yml config
  ```

## 🚀 Deployment Steps

### Step 1: Transfer Files to Server
```bash
# From local machine:
rsync -av --exclude=node_modules --exclude=.git --exclude=dist \
  D:\Project\dataspace/ \
  dt-admin@45.158.126.171:/opt/dataspace/
```

### Step 2: SSH to Server
```bash
ssh dt-admin@45.158.126.171
cd /opt/dataspace
```

### Step 3: Stop Existing Services
```bash
docker-compose -f infra/docker/docker-compose.production.yml down
```

### Step 4: Clean Old Containers & Images (Optional but Recommended)
```bash
# Remove old containers
docker container prune -f

# Remove old images
docker image prune -af

# Remove unused volumes (CAREFUL - this removes data)
# docker volume prune -f
```

### Step 5: Build with New Configuration
```bash
docker-compose -f infra/docker/docker-compose.production.yml build --no-cache
```

### Step 6: Start Services
```bash
docker-compose -f infra/docker/docker-compose.production.yml up -d
```

### Step 7: Monitor Startup
```bash
# Watch logs
docker-compose -f infra/docker/docker-compose.production.yml logs -f

# In another terminal, check status
watch docker-compose -f infra/docker/docker-compose.production.yml ps
```

## 🔍 Post-Deployment Verification

### 1. Check Container Status
```bash
docker-compose -f infra/docker/docker-compose.production.yml ps
```
**Expected:** All containers should show "Up" status, no "Exit 1" or "Restarting"

### 2. Verify Port Bindings
```bash
netstat -tlnp | grep -E ':(3000|3001|3002|5174)'
```
**Expected:** Ports should show `0.0.0.0:PORT` or `:::PORT`, NOT `45.158.126.171:PORT`

### 3. Test Internal Service Communication
```bash
# Test if services can reach each other internally
docker exec dataspace-idp-prod curl -s http://broker:3001/health
docker exec dataspace-broker-prod curl -s http://idp:3000/health
```
**Expected:** Should return health check responses, not connection errors

### 4. Test External Access (from local machine or browser)
```bash
# Test from your local machine:
curl http://45.158.126.171:3000/health
curl http://45.158.126.171:3001/health
curl http://45.158.126.171:5174
```
**Expected:** Should return responses, not "connection refused"

### 5. Check Frontend in Browser
Open in browser:
- Frontend: http://45.158.126.171:5174
- Check browser console for any API call errors
- Verify network tab shows calls to `http://45.158.126.171:3000`, `3001`, etc.

### 6. Check Service Logs for Errors
```bash
# Check for any errors in logs
docker-compose -f infra/docker/docker-compose.production.yml logs --tail=50 | grep -i error

# Check specific service
docker logs dataspace-idp-prod --tail=50
docker logs dataspace-broker-prod --tail=50
docker logs dataspace-frontend-prod --tail=50
```

## ⚠️ Common Issues & Solutions

### Issue 1: Services Keep Restarting
```bash
# Check logs for the failing service
docker logs <service-name> --tail=100

# Common causes:
# 1. Port binding error → Check ports are 0.0.0.0:PORT not IP:PORT
# 2. Database connection → Check postgres is healthy
# 3. Environment variables → Check .env file exists
```

### Issue 2: Cannot Access from Browser
```bash
# Check firewall
sudo ufw status
sudo iptables -L -n | grep 5174

# Check service is actually listening
netstat -tlnp | grep 5174

# Check from server itself first
curl http://localhost:5174
```

### Issue 3: Frontend Shows API Errors
```javascript
// In browser console, check what URLs are being called
// Should see: http://45.158.126.171:3000/...
// NOT: http://localhost:3000/...
// NOT: http://idp:3000/... (internal name)
```

### Issue 4: "Address already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or stop conflicting service
docker-compose -f infra/docker/docker-compose.production.yml down
```

## 📊 Health Check Commands

```bash
# Quick status check
docker-compose -f infra/docker/docker-compose.production.yml ps

# Detailed container inspection
docker stats

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' dataspace-idp-prod

# Check all service health
for service in idp broker hub; do
  echo "=== $service ==="
  docker inspect --format='{{.State.Health.Status}}' dataspace-${service}-prod
done
```

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Stop new deployment
docker-compose -f infra/docker/docker-compose.production.yml down

# Restore from backup (if you made one)
# OR

# Revert code changes locally and redeploy
git checkout <previous-commit>

# Redeploy old version
# Follow deployment steps again
```

## 📝 Configuration Summary

### Port Bindings (CORRECT)
```yaml
ports:
  - "0.0.0.0:3000:3000"  # ✅ Correct
  - "3000:3000"          # ✅ Also correct (defaults to 0.0.0.0)
```

### Port Bindings (WRONG)
```yaml
ports:
  - "45.158.126.171:3000:3000"  # ❌ WRONG - causes bind errors
```

### Environment Variables

**Backend Services (Internal Communication):**
```env
DB_HOST=postgres          # ✅ Docker service name
REDIS_HOST=redis          # ✅ Docker service name
IDP_URL=http://idp:3000   # ✅ Docker service name
```

**Frontend (External Communication):**
```env
VITE_API_URL=http://45.158.126.171           # ✅ Server IP
VITE_IDP_API_URL=http://45.158.126.171:3000  # ✅ Server IP:PORT
```

## 📞 Support Commands

### View All Logs
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs -f
```

### View Specific Service
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs -f idp
```

### Restart Specific Service
```bash
docker-compose -f infra/docker/docker-compose.production.yml restart idp
```

### Rebuild Single Service
```bash
docker-compose -f infra/docker/docker-compose.production.yml build idp
docker-compose -f infra/docker/docker-compose.production.yml up -d idp
```

### Shell into Container
```bash
docker exec -it dataspace-idp-prod sh
```

### Check Environment Variables in Container
```bash
docker exec dataspace-idp-prod env | grep -E '(DB_|REDIS_|KAFKA_)'
```

## ✅ Success Indicators

- [ ] All containers show "Up" status
- [ ] No containers in "Restarting" state
- [ ] Health checks show "healthy" status
- [ ] Can access frontend at http://45.158.126.171:5174
- [ ] Can access API endpoints at http://45.158.126.171:3000/health, etc.
- [ ] Browser console shows no CORS or network errors
- [ ] Frontend successfully loads data from backend services
- [ ] Services logs show normal operations, no repeated errors

---

**Last Updated:** 2025-11-28
**Server:** 45.158.126.171
**Docker Compose File:** infra/docker/docker-compose.production.yml
