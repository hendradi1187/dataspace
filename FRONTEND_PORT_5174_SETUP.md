# Frontend Port 5174 Setup Guide (Production Build)

## Overview
- **Port 5173**: Development mode (Vite Dev Server dengan hot reload)
- **Port 5174**: Production mode (Static files served dengan `serve` package)

## Files Updated

### 1. **Dockerfile** (apps/frontend/Dockerfile)
- Multi-stage build process
- Stage 1: Build React + Vite → static files (dist/)
- Stage 2: Serve static files via `serve` package on port 5174
- Support untuk environment variables via build args
- Include health check

### 2. **Docker Compose Config** (infra/docker/docker-compose.dev.5174.yml)
- Override configuration untuk port 5174
- Support environment variables dari `.env.production`
- Dapat di-compose dengan base docker-compose.yml

## Setup Instructions

### Option A: Local Development (Fastest)

```bash
cd D:/BMAD-METHOD/dataspace/apps/frontend

# Build production version
pnpm run build

# Serve static files on port 5174
pnpm run preview -- --host 0.0.0.0 --port 5174
```

### Option B: Docker Build & Run (Single Container)

```bash
cd D:/BMAD-METHOD/dataspace

# Build Docker image
docker build -f apps/frontend/Dockerfile -t dataspace-frontend:latest .

# Run container
docker run -p 5174:5174 dataspace-frontend:latest
```

### Option C: Docker Compose (Full Stack with All Services)

#### Using Base Compose + Override:
```bash
cd D:/BMAD-METHOD/dataspace/infra/docker

# Compose with override untuk port 5174
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.5174.yml \
  up --build frontend

# Atau dengan .env
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.5174.yml \
  --env-file ../../.env.production \
  up --build
```

#### Run Full Stack (Recommended):
```bash
cd D:/BMAD-METHOD/dataspace/infra/docker

# Build semua services termasuk frontend
docker-compose --env-file ../../.env.production up --build

# Frontend akan berjalan di port 5174
# Akses: http://localhost:5174
```

## Environment Variables Configuration

### Local Development (.env)
```
VITE_IDP_API_URL=http://localhost:3000
VITE_BROKER_API_URL=http://localhost:3001
VITE_HUB_API_URL=http://localhost:3002
# ... dll
```

### Production (.env.production)
```
VITE_API_URL=http://45.158.126.171
VITE_IDP_API_URL=http://45.158.126.171:3000
VITE_BROKER_API_URL=http://45.158.126.171:3001
# ... dll
```

### Docker Environment Variables
Saat build Docker, env vars akan di-embed ke dalam static files selama build time.

**Build dengan custom environment:**
```bash
docker build \
  -f apps/frontend/Dockerfile \
  --build-arg VITE_API_URL=http://45.158.126.171 \
  --build-arg VITE_IDP_API_URL=http://45.158.126.171:3000 \
  -t dataspace-frontend:latest .
```

## Dockerfile Build Args

Tersedia build arguments untuk customize environment saat build:

```dockerfile
ARG VITE_API_URL=http://localhost
ARG VITE_IDP_API_URL=http://localhost:3000
ARG VITE_BROKER_API_URL=http://localhost:3001
ARG VITE_HUB_API_URL=http://localhost:3002
ARG VITE_POLICY_API_URL=http://localhost:3003
ARG VITE_CONTRACT_API_URL=http://localhost:3004
ARG VITE_COMPLIANCE_API_URL=http://localhost:3005
ARG VITE_LEDGER_API_URL=http://localhost:3006
ARG VITE_CLEARING_API_URL=http://localhost:3007
ARG VITE_APPSTORE_API_URL=http://localhost:3008
ARG VITE_CONNECTOR_API_URL=http://localhost:3009
```

## Troubleshooting

### Frontend tidak accessible di port 5174

1. Check container running:
```bash
docker ps | grep frontend
```

2. Check container logs:
```bash
docker logs dataspace-frontend-prod
```

3. Test port dari host:
```bash
curl http://localhost:5174
```

### API calls tidak berhasil dari frontend

1. Pastikan environment variables benar:
```bash
docker inspect dataspace-frontend-prod | grep VITE_
```

2. Check vite.config.ts untuk proxy settings

3. Verify service containers berjalan:
```bash
docker ps | grep -E "(idp|broker|hub)"
```

### Build error dependency

Jika ada error saat `pnpm install`:
```bash
# Clean cache
rm -rf node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
```

## Port Summary

| Port | Service | Type | Command |
|------|---------|------|---------|
| 5173 | Frontend | Dev Server | `pnpm run dev` |
| 5174 | Frontend | Production | `pnpm run build` + `serve` / Docker |
| 3000-3011 | Microservices | - | - |

## Next Steps

1. Test lokal dengan `pnpm run preview` di port 5174
2. Build Docker image: `docker build -f apps/frontend/Dockerfile`
3. Run full stack: `docker-compose up --build`
4. Verify frontend berjalan di port 5174

## Additional Notes

- Frontend di port 5174 adalah **production build** (optimized & minified)
- Static files di-serve oleh `serve` package (HTTP server sederhana)
- Build time environment variables di-embed ke dalam JavaScript bundles
- Untuk update API URLs, perlu rebuild Docker image (tidak bisa runtime)
