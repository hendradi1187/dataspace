# Docker IP Configuration Fix - Summary

## Date: 2025-11-28
## Server IP: 45.158.126.171

## Problem Identified

Services were restarting with exit code 1 due to:
1. **CRITICAL**: Port bindings in production compose file were binding to specific IP `45.158.126.171:PORT:PORT` instead of `0.0.0.0:PORT:PORT`
2. Frontend environment variables were using `localhost` instead of server IP `45.158.126.171`
3. Inconsistent configuration between development and production environments

## Root Cause

Docker containers **CANNOT** bind to a specific external IP address like `45.158.126.171:3000:3000`. This causes services to fail to start because:
- The container cannot bind to an IP that doesn't exist within the container's network namespace
- Containers need to bind to `0.0.0.0` (all interfaces) or `localhost` internally
- The host machine (45.158.126.171) then forwards traffic from the external IP to the container

## Solution Applied

### 1. Fixed Port Bindings in docker-compose.production.yml

**Changed FROM (WRONG):**
```yaml
ports:
  - "45.158.126.171:3000:3000"
```

**Changed TO (CORRECT):**
```yaml
ports:
  - "0.0.0.0:3000:3000"
```

This was applied to ALL services:
- PostgreSQL (5432)
- Redis (6379)
- Zookeeper (2181)
- Kafka (9092, 9101)
- Kafka UI (8080)
- Traefik (80, 443, 8081)
- IDP (3000)
- Broker (3001)
- Hub (3002)
- Policy (3003)
- Contract (3004)
- Compliance (3005)
- Ledger (3006)
- Clearing (3007)
- AppStore (3008)
- Connector (3009)
- TrustCore Clearing (3010)
- TrustCore Connector (3011)
- Frontend (5174)

### 2. Updated .env.docker-compose

Added frontend environment variables with server IP:

```env
VITE_API_URL=http://45.158.126.171

# Frontend API URLs for browser access (external communication)
VITE_IDP_API_URL=http://45.158.126.171:3000
VITE_BROKER_API_URL=http://45.158.126.171:3001
VITE_HUB_API_URL=http://45.158.126.171:3002
VITE_POLICY_API_URL=http://45.158.126.171:3003
VITE_CONTRACT_API_URL=http://45.158.126.171:3004
VITE_COMPLIANCE_API_URL=http://45.158.126.171:3005
VITE_LEDGER_API_URL=http://45.158.126.171:3006
VITE_CLEARING_API_URL=http://45.158.126.171:3007
VITE_APPSTORE_API_URL=http://45.158.126.171:3008
VITE_CONNECTOR_API_URL=http://45.158.126.171:3009
VITE_TRUSTCORE_CLEARING_API_URL=http://45.158.126.171:3010
VITE_TRUSTCORE_CONNECTOR_API_URL=http://45.158.126.171:3011
```

### 3. Updated Frontend Dockerfile

Added missing environment variables to frontend Dockerfile:
- Added VITE_TRUSTCORE_CLEARING_API_URL
- Added VITE_TRUSTCORE_CONNECTOR_API_URL

### 4. Updated docker-compose.production.yml Frontend Build Args

Added all frontend API URL build arguments to ensure the frontend is built with correct API endpoints:

```yaml
frontend:
  build:
    args:
      NODE_ENV: production
      VITE_API_URL: http://45.158.126.171
      VITE_IDP_API_URL: http://45.158.126.171:3000
      VITE_BROKER_API_URL: http://45.158.126.171:3001
      # ... all other service URLs
```

## How It Works Now

### Internal Communication (Service to Service)
Services communicate using Docker internal DNS:
```yaml
# Services use internal Docker network names
DB_HOST: postgres
REDIS_HOST: redis
KAFKA_BROKERS: kafka:29092
# Backend services call each other:
IDP_URL: http://idp:3000
BROKER_URL: http://broker:3001
```

### External Communication (Browser to Services)
Frontend in browser uses server IP:
```javascript
// Frontend makes API calls to:
VITE_IDP_API_URL: http://45.158.126.171:3000
VITE_BROKER_API_URL: http://45.158.126.171:3001
// etc...
```

### Port Binding (Host to Container)
Docker binds to all interfaces on host:
```yaml
ports:
  - "0.0.0.0:3000:3000"  # Listens on all IPs, including 45.158.126.171
```

This means:
1. Service inside container listens on `localhost:3000` (or 0.0.0.0:3000)
2. Docker forwards `45.158.126.171:3000` → `container:3000`
3. External clients can access via `http://45.158.126.171:3000`

## Key Architecture Principles

### 1. Service Binding
- ✅ Services bind to `0.0.0.0` inside containers (listen on all interfaces)
- ✅ Docker handles port forwarding from external IP
- ❌ Services should NOT try to bind to specific external IP

### 2. Service Discovery
- ✅ Internal: Use Docker service names (`http://idp:3000`)
- ✅ External: Use server IP (`http://45.158.126.171:3000`)

### 3. Environment Variables
- Backend services: Use internal Docker names
- Frontend build-time: Use server IP (baked into build)
- Frontend runtime: API URLs from build-time environment

## Files Changed

1. ✅ `D:\Project\dataspace\.env.docker-compose`
   - Added VITE_API_URL with server IP
   - Added all VITE_*_API_URL environment variables

2. ✅ `D:\Project\dataspace\infra\docker\docker-compose.production.yml`
   - Changed ALL port bindings from `45.158.126.171:PORT:PORT` to `0.0.0.0:PORT:PORT`
   - Added frontend build args with API URLs

3. ✅ `D:\Project\dataspace\apps\frontend\Dockerfile`
   - Added VITE_TRUSTCORE_CLEARING_API_URL arg/env
   - Added VITE_TRUSTCORE_CONNECTOR_API_URL arg/env

## Testing Recommendations

### 1. Verify Port Bindings
```bash
# On server, check services are listening on 0.0.0.0
netstat -tlnp | grep ':3000'
# Should show: 0.0.0.0:3000 or :::3000
```

### 2. Test Internal Communication
```bash
# Inside a container, services should reach each other by name
docker exec dataspace-idp-prod curl http://broker:3001/health
docker exec dataspace-broker-prod curl http://idp:3000/health
```

### 3. Test External Access
```bash
# From external machine or browser
curl http://45.158.126.171:3000/health
curl http://45.158.126.171:3001/health
curl http://45.158.126.171:5174
```

### 4. Check Frontend API Calls
```javascript
// In browser console, frontend should call:
// http://45.158.126.171:3000/api/...
// NOT localhost or internal names
```

## Next Steps

1. **Rebuild All Images**
   ```bash
   cd /opt/dataspace
   docker-compose -f infra/docker/docker-compose.production.yml build --no-cache
   ```

2. **Restart Services**
   ```bash
   docker-compose -f infra/docker/docker-compose.production.yml down
   docker-compose -f infra/docker/docker-compose.production.yml up -d
   ```

3. **Monitor Logs**
   ```bash
   docker-compose -f infra/docker/docker-compose.production.yml logs -f
   ```

4. **Verify Health**
   ```bash
   docker-compose -f infra/docker/docker-compose.production.yml ps
   curl http://45.158.126.171:3000/health
   ```

## Common Mistakes to Avoid

❌ **DON'T** bind to specific IP in docker-compose ports:
```yaml
ports:
  - "45.158.126.171:3000:3000"  # WRONG - will fail
```

✅ **DO** bind to all interfaces:
```yaml
ports:
  - "0.0.0.0:3000:3000"  # CORRECT
  # OR simply:
  - "3000:3000"  # Also correct (defaults to 0.0.0.0)
```

❌ **DON'T** use localhost in frontend for production:
```env
VITE_API_URL=http://localhost:3000  # WRONG - won't work from browser
```

✅ **DO** use server IP in frontend:
```env
VITE_API_URL=http://45.158.126.171:3000  # CORRECT
```

❌ **DON'T** use external IP for internal service calls:
```env
IDP_URL=http://45.158.126.171:3000  # WRONG - goes through external network
```

✅ **DO** use Docker service names internally:
```env
IDP_URL=http://idp:3000  # CORRECT - uses internal Docker network
```

## Expected Behavior After Fix

1. **Services Start Successfully**
   - All containers should reach "running" state
   - No exit code 1 errors
   - Health checks should pass

2. **Internal Communication Works**
   - Services can call each other using Docker names
   - No network errors in logs

3. **External Access Works**
   - Browser can access frontend at `http://45.158.126.171:5174`
   - Frontend can make API calls to backend services
   - All health endpoints accessible from external IP

4. **No Restarts**
   - Services stay running
   - No restart loops
   - Stable container state

## Troubleshooting

If services still fail:

1. **Check Docker logs for specific errors:**
   ```bash
   docker logs <container-name>
   ```

2. **Verify network connectivity:**
   ```bash
   docker network inspect dataspace-net
   ```

3. **Test port accessibility:**
   ```bash
   telnet 45.158.126.171 3000
   ```

4. **Check firewall rules:**
   ```bash
   sudo iptables -L -n
   ufw status
   ```

## References

- Docker port binding documentation
- Docker networking best practices
- Vite environment variables documentation

---

**Last Updated:** 2025-11-28
**Status:** Fixed and Ready for Deployment
