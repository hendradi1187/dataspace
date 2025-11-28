# 📊 Visual Migration Guide: Windows Dev → Linux Prod

## 🎯 Architecture Change

### SEBELUM - Development (Windows)
```
┌─────────────────────────────────────────────────┐
│          WINDOWS (Local Development)            │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│   Docker Compose (docker-compose.dev.yml)       │
├─────────────────────────────────────────────────┤
│ ┌───────────────┬───────────────────────────┐   │
│ │  PostgreSQL   │  Redis  │  Kafka │ Front  │   │
│ │  :5432        │  :6379  │ :9092  │ :5174  │   │
│ │  (localhost)  │ (no pw) │        │        │   │
│ └───────────────┴───────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ Services: 3000-3011 (localhost)                 │
├─────────────────────────────────────────────────┤
│ Environment: development                        │
│ Log Level:   debug                              │
│ Logging:     10m max-size, 3 files              │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│        Access: http://localhost:5174            │
└─────────────────────────────────────────────────┘
```

### SESUDAH - Production (Linux Server)
```
┌──────────────────────────────────────────────┐
│    LINUX SERVER (45.158.126.171)            │
│         Production Environment              │
└──────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│  Docker Compose (docker-compose.production.yml)
├──────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐   │
│ │    Services with 2+ Replicas           │   │
│ │    (Load Balanced)                     │   │
│ │                                        │   │
│ │  IDP (×2)    │  Broker (×2)  │ Hub (×2) │   │
│ │  :3000       │  :3001        │ :3002    │   │
│ │                                        │   │
│ │  Policy, Contract, Compliance, etc.    │   │
│ │  :3003-3011 (×1 each)                  │   │
│ │                                        │   │
│ │  Frontend (×2) | Kafka | Redis | DB    │   │
│ │  :5174         | :9092 | :6379 | :5432 │   │
│ │                                        │   │
│ └────────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│ All ports bound to: 45.158.126.171:PORT      │
├──────────────────────────────────────────────┤
│ Environment: production                      │
│ Log Level:   info                            │
│ Logging:     100m max-size, 10 files         │
│ Restart:     always (auto-recovery)          │
│ Resources:   Limited & Reserved              │
└──────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│  Traefik Reverse Proxy (Port 80/443)        │
├──────────────────────────────────────────────┤
│  Route: /api/idp      → IDP (×2)             │
│  Route: /api/broker   → Broker (×2)          │
│  Route: /api/hub      → Hub (×2)             │
│  Route: /            → Frontend (×2)         │
└──────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│     Access: http://45.158.126.171:5174       │
│            (or with SSL/TLS)                 │
└──────────────────────────────────────────────┘
```

---

## 📋 Side-by-Side Configuration Comparison

### Environment Variables

| Aspek | Development | Production |
|-------|-------------|------------|
| **NODE_ENV** | `development` | `production` ← UBAH |
| **DB_HOST** | `localhost` | `postgres` (internal) |
| **DB_NAME** | `dataspace_dev` | `dataspace_prod` ← UBAH |
| **DB_PASSWORD** | `postgres` | `${DB_PASSWORD}` ← UBAH |
| **LOG_LEVEL** | `debug` | `info` ← UBAH |
| **IDP_URL** | `http://localhost:3000` | `http://45.158.126.171:3000` ← UBAH |
| **REDIS_PASSWORD** | (none) | `${REDIS_PASSWORD}` ← UBAH |

### Service Configuration

```yaml
# DEVELOPMENT
services:
  postgres:
    ports: ["5432:5432"]           # Semua interface
    environment:
      POSTGRES_PASSWORD: postgres   # Hardcoded
      POSTGRES_DB: dataspace_dev
    restart: unless-stopped
    logging:
      max-size: "10m"
      max-file: "3"

  idp:
    ports: ["3000:3000"]           # All interfaces
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
    restart: unless-stopped
```

```yaml
# PRODUCTION
services:
  postgres:
    ports: ["45.158.126.171:5432:5432"]  # Specific IP ← UBAH
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # From .env ← UBAH
      POSTGRES_DB: ${DB_NAME}            # From .env
    restart: always                      # ← UBAH
    logging:
      max-size: "100m"                   # ← UPGRADE
      max-file: "10"                     # ← UPGRADE

  idp:
    ports: ["45.158.126.171:3000:3000"]  # Specific IP ← UBAH
    environment:
      NODE_ENV: production               # ← UBAH
      LOG_LEVEL: info                    # ← UBAH
    deploy:
      replicas: 2                        # ← TAMBAH (HA)
    restart: always                      # ← UBAH
```

---

## 🔄 File Structure Changes

### Development
```
dataspace/
├── .env (local)
├── .env.example
├── docker-compose.dev.yml
├── docker-compose.yml
└── infra/docker/
    ├── docker-compose.yml
    ├── docker-compose.infrastructure.yml
    └── docker-compose.extended.yml
```

### Production (TAMBAHAN)
```
dataspace/
├── .env (local - jangan digunakan)
├── .env.example
├── .env.production ← BARU (jangan commit ke git!)
├── docker-compose.dev.yml
├── docker-compose.yml
├── infra/docker/
│   ├── docker-compose.yml
│   ├── docker-compose.production.yml ← BARU
│   ├── docker-compose.infrastructure.yml
│   └── docker-compose.extended.yml
├── infra/traefik/
│   ├── traefik.yml
│   ├── traefik.production.yml ← BARU
│   ├── dynamic.yml
│   └── dynamic.production.yml ← BARU
├── deploy-linux.sh ← BARU (automated deployment)
├── DEPLOYMENT_GUIDE_LINUX.md ← BARU
├── DOCKER_CHANGES_SUMMARY.md ← BARU
├── QUICK_START_DEPLOYMENT.md ← BARU
└── MIGRATION_VISUAL_GUIDE.md ← BARU
```

---

## 🎯 Port Mapping Comparison

### Development (localhost)
```
┌─────────────┬─────────────────┬──────────────────┐
│ Service     │ Port            │ Access           │
├─────────────┼─────────────────┼──────────────────┤
│ IDP         │ localhost:3000  │ http://local:3000│
│ Broker      │ localhost:3001  │ http://local:3001│
│ Hub         │ localhost:3002  │ http://local:3002│
│ Policy      │ localhost:3003  │ http://local:3003│
│ Contract    │ localhost:3004  │ http://local:3004│
│ Compliance  │ localhost:3005  │ http://local:3005│
│ Ledger      │ localhost:3006  │ http://local:3006│
│ Clearing    │ localhost:3007  │ http://local:3007│
│ AppStore    │ localhost:3008  │ http://local:3008│
│ Connector   │ localhost:3009  │ http://local:3009│
│ Frontend    │ localhost:5174  │ http://local:5174│
│ PostgreSQL  │ localhost:5432  │ Internal only    │
│ Redis       │ localhost:6379  │ Internal only    │
│ Kafka       │ localhost:9092  │ Internal only    │
└─────────────┴─────────────────┴──────────────────┘
```

### Production (45.158.126.171)
```
┌─────────────┬──────────────────────┬─────────────────────────┐
│ Service     │ Port                 │ Access                  │
├─────────────┼──────────────────────┼─────────────────────────┤
│ IDP         │ 45.158.126.171:3000  │ http://45.158.126.171:3000
│ Broker      │ 45.158.126.171:3001  │ http://45.158.126.171:3001
│ Hub         │ 45.158.126.171:3002  │ http://45.158.126.171:3002
│ Policy      │ 45.158.126.171:3003  │ http://45.158.126.171:3003
│ Contract    │ 45.158.126.171:3004  │ http://45.158.126.171:3004
│ Compliance  │ 45.158.126.171:3005  │ http://45.158.126.171:3005
│ Ledger      │ 45.158.126.171:3006  │ http://45.158.126.171:3006
│ Clearing    │ 45.158.126.171:3007  │ http://45.158.126.171:3007
│ AppStore    │ 45.158.126.171:3008  │ http://45.158.126.171:3008
│ Connector   │ 45.158.126.171:3009  │ http://45.158.126.171:3009
│ Frontend    │ 45.158.126.171:5174  │ http://45.158.126.171:5174
│ Traefik     │ 45.158.126.171:8081  │ Dashboard               │
│ Kafka UI    │ 45.158.126.171:8080  │ UI for Kafka mgmt       │
│ PostgreSQL  │ 45.158.126.171:5432  │ DB access only          │
│ Redis       │ 45.158.126.171:6379  │ Cache only              │
│ Kafka       │ 45.158.126.171:9092  │ Kafka broker            │
└─────────────┴──────────────────────┴─────────────────────────┘
```

---

## 🔐 Security Evolution

### Development (Tidak Aman)
```
┌──────────────────────────────────────────────┐
│ Passwords Hardcoded                          │
├──────────────────────────────────────────────┤
│ DB_PASSWORD: postgres                        │
│ REDIS_PASSWORD: none                         │
│ All ports accessible: 0.0.0.0                │
│ Log level: DEBUG (verbose)                   │
│ TLS/SSL: None                                │
│ Authentication: None                         │
└──────────────────────────────────────────────┘
```

### Production (Aman)
```
┌──────────────────────────────────────────────┐
│ Passwords Dalam Environment Variables        │
├──────────────────────────────────────────────┤
│ DB_PASSWORD: ${DB_PASSWORD} (aman)           │
│ REDIS_PASSWORD: ${REDIS_PASSWORD} (aman)    │
│ JWT_SECRET: ${JWT_SECRET} (aman)             │
│ Ports bound to specific IP: 45.158.126.171   │
│ Log level: INFO (reduced verbosity)          │
│ TLS/SSL: Ready dengan Let's Encrypt          │
│ Authentication: Basic auth untuk monitoring  │
│ File permissions: .env = 600 (owner only)    │
│ Secrets management: Environment variables    │
└──────────────────────────────────────────────┘
```

---

## 📊 Resource Usage Comparison

### Development
```
┌─────────────────────────────────────────────┐
│ Resource Allocation (Minimal)               │
├─────────────────────────────────────────────┤
│ PostgreSQL:                                 │
│   Limits:      2G CPU + 2G Memory           │
│   Default:     No reservation               │
│                                             │
│ Services (each):                            │
│   Limits:      0.5-1 CPU + 256M-512M Mem   │
│   Default:     No reservation               │
│                                             │
│ Total Typical:  3-4 GB Memory               │
└─────────────────────────────────────────────┘
```

### Production
```
┌─────────────────────────────────────────────┐
│ Resource Allocation (Production)            │
├─────────────────────────────────────────────┤
│ PostgreSQL:                                 │
│   Limits:      2 CPU + 2G Memory            │
│   Reservation: 1 CPU + 1G Memory            │
│                                             │
│ Services (each):                            │
│   Limits:      0.5-1 CPU + 256M-512M Mem   │
│   Reservation: 0.25-0.5 CPU + 128M-256M    │
│                                             │
│ Total Typical:  6-8 GB Memory (safe)        │
│ Minimum Server: 4GB RAM                     │
│ Recommended:   8GB+ RAM                     │
└─────────────────────────────────────────────┘
```

---

## 🚀 Deployment Flow Comparison

### Development (Manual)
```
1. npm install
   └─ Download dependencies

2. docker-compose -f docker-compose.dev.yml up
   └─ Start all services (verbose logs)

3. Manual testing
   └─ Check http://localhost:5174

4. Manual debugging
   └─ Read console logs
```

### Production (Automated)
```
1. bash deploy-linux.sh
   ├─ Validate configuration
   ├─ Test SSH connection
   ├─ Copy files (rsync)
   ├─ Build images (docker build)
   ├─ Start services (docker-compose up -d)
   ├─ Wait for health checks
   ├─ Verify all services
   └─ Print summary

2. Automated health checks
   └─ All endpoints verified

3. Monitoring & logs
   └─ docker-compose logs -f
```

---

## 📈 Scaling Comparison

### Development (1 Instance)
```
┌────────────────────────────────────┐
│   Single Instance (No HA)           │
├────────────────────────────────────┤
│   IDP → 1 container                │
│   Broker → 1 container             │
│   Hub → 1 container                │
│   Frontend → 1 container           │
│   Database → 1 container (SPOF*)   │
│                                    │
│   * SPOF = Single Point of Failure │
│   (If one fails, all fail)         │
└────────────────────────────────────┘
```

### Production (Distributed)
```
┌────────────────────────────────────┐
│   Multiple Instances (HA Ready)    │
├────────────────────────────────────┤
│   IDP → 2 containers (LB)          │
│   Broker → 2 containers (LB)       │
│   Hub → 2 containers (LB)          │
│   Policy → 1 container             │
│   Contract → 1 container           │
│   Compliance → 1 container         │
│   ... (others) → 1 each            │
│   Frontend → 2 containers (LB)     │
│   Database → 1 container (backup)  │
│   Redis → 1 container              │
│   Kafka → 1 cluster                │
│   Traefik → Load Balancer          │
│                                    │
│   LB = Load Balanced across 2 inst │
│   Able to handle service restart   │
└────────────────────────────────────┘
```

---

## 🔄 Update Flow Comparison

### Development
```
1. Edit source code
   ↓
2. docker-compose restart [service]
   ↓
3. Manual test
```

### Production
```
1. Update source code (git push)
   ↓
2. SSH to server
   ↓
3. cd /opt/dataspace && git pull
   ↓
4. docker-compose build [service]
   ↓
5. docker-compose up -d
   ↓
6. Health checks automatic
   ↓
7. If failed → automatic rollback
```

---

## 📚 Key Files Reference

| File | Dev | Prod | Purpose |
|------|-----|------|---------|
| `.env` | ✅ | ❌ | Development only |
| `.env.production` | ❌ | ✅ | Production only |
| `docker-compose.yml` | ✅ | ⚠️ | Core services |
| `docker-compose.production.yml` | ❌ | ✅ | Production deployment |
| `traefik.yml` | ✅ | ⚠️ | Reverse proxy config |
| `traefik.production.yml` | ❌ | ✅ | Production proxy config |
| `deploy-linux.sh` | ❌ | ✅ | Automated deployment |

---

## ✅ Verification Checklist

### Before Migration
- [ ] All passwords updated in .env.production
- [ ] docker-compose.production.yml validated
- [ ] SSH connection to server works
- [ ] Server has 50GB+ disk space

### After Migration
- [ ] All 13 containers running
- [ ] Health checks passing
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] Logs show no errors
- [ ] Database initialized
- [ ] Monitoring setup complete

---

**Last Updated:** 2024-11-28
**Version:** 1.0
**Status:** Ready for Production Deployment
