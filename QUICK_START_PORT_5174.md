# Quick Start: Frontend Port 5174

## Status ✅
Docker image **berhasil di-build** dan **tested** - Frontend berjalan di port 5174!

## Quick Test (Already Built)

```bash
# Test dengan Docker (container sudah build)
docker rm -f test-frontend 2>/dev/null || true
docker run -d -p 15174:5174 dataspace-frontend:latest
curl http://localhost:15174  # Should return HTML
docker rm -f test-frontend
```

## Production: Port 5174 (3 Options)

### Option 1: Local Build & Run (Recommended for Testing)
```bash
cd apps/frontend

# Build production version
pnpm run build

# Run preview server on port 5174
pnpm run preview -- --host 0.0.0.0 --port 5174
```
✅ Fastest
✅ Direct access
✅ No Docker dependency

---

### Option 2: Docker Container Only
```bash
cd D:/BMAD-METHOD/dataspace

# Build image
docker build -f apps/frontend/Dockerfile -t dataspace-frontend:latest .

# Run container
docker run -p 5174:5174 dataspace-frontend:latest

# Access: http://localhost:5174
```

---

### Option 3: Full Stack (Docker Compose)
```bash
cd infra/docker

# Start all services including frontend on port 5174
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.5174.yml \
  --env-file ../../.env.production \
  up --build

# Access: http://localhost:5174
```

---

## Using Setup Script

```bash
# Make executable (if needed)
chmod +x setup-frontend-5174.sh

# View all commands
./setup-frontend-5174.sh

# Run local
./setup-frontend-5174.sh run-local

# Run Docker
./setup-frontend-5174.sh build-docker
./setup-frontend-5174.sh run-docker

# Full stack
./setup-frontend-5174.sh compose
./setup-frontend-5174.sh compose-detach

# Check logs
./setup-frontend-5174.sh logs

# Stop
./setup-frontend-5174.sh stop
```

---

## Verify Setup

```bash
# Test from command line
curl http://localhost:5174

# Should return HTML like:
# <!doctype html>
# <html lang="en">
#   <head>
#     <title>Dataspace Platform - Dashboard</title>
#   ...
```

---

## Port Summary

| Port | Service | Mode | How To Run |
|------|---------|------|-----------|
| **5173** | Frontend | Development | `cd apps/frontend && pnpm run dev` |
| **5174** | Frontend | Production | See options above ↑ |
| 3000-3011 | Backend Services | - | `docker-compose up` |

---

## Environment Variables

Frontend dalam Docker akan menggunakan environment variables dari:

1. **`.env.production`** - Default production config
2. **Build arguments** - Jika pass saat docker build

Untuk update API URLs:
```bash
docker build \
  --build-arg VITE_API_URL=http://45.158.126.171 \
  --build-arg VITE_IDP_API_URL=http://45.158.126.171:3000 \
  -f apps/frontend/Dockerfile \
  -t dataspace-frontend:latest .
```

---

## Troubleshooting

### Port 5174 already in use
```bash
# Find what's using it
netstat -ano | findstr 5174

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
docker run -p 5175:5174 dataspace-frontend:latest
```

### Frontend not loading
```bash
# Check container status
docker ps | grep frontend

# View logs
docker logs <container_id>

# Check if service is responding
curl -v http://localhost:5174
```

### API calls failing
1. Check microservices are running (ports 3000-3011)
2. Verify `.env.production` has correct API URLs
3. Check browser console for CORS errors

---

## Files Changed

- ✅ `apps/frontend/Dockerfile` - Production build config
- ✅ `infra/docker/docker-compose.dev.5174.yml` - Compose override
- ✅ `setup-frontend-5174.sh` - Helper script
- 📄 `FRONTEND_PORT_5174_SETUP.md` - Detailed guide
- 📄 `QUICK_START_PORT_5174.md` - This file

---

## Next Steps

1. **Choose your setup method** (Option 1, 2, or 3 above)
2. **Run frontend** on port 5174
3. **Test buttons** - Same as port 5173 but with production build
4. **Deploy** when ready to production

---

## Questions?

For detailed information, see:
- `FRONTEND_PORT_5174_SETUP.md` - Complete setup guide
- `apps/frontend/Dockerfile` - Docker build configuration
- `infra/docker/docker-compose.dev.5174.yml` - Compose configuration
