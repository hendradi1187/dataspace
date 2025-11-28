# 📋 Docker Configuration Changes - Windows to Linux Migration

Dokumen ini merangkum **SEMUA perubahan Docker configuration** yang diperlukan saat migrasi dari Windows (development) ke Linux Server (45.158.126.171).

---

## 🎯 Ringkasan Perubahan Utama

| Aspek | Windows (Dev) | Linux (Prod) | Keterangan |
|-------|---------------|--------------|-----------|
| **Environment** | development | production | NODE_ENV wajib berubah |
| **Host Services** | localhost | 45.158.126.171 | Service URLs harus IP server |
| **Database** | dataspace_dev | dataspace_prod | Database name berbeda |
| **DB Password** | postgres | HARUS SECURE | Password harus aman |
| **Port Binding** | 0.0.0.0:port | 45.158.126.171:port | Bind ke IP spesifik |
| **Logging** | debug | info | Reduce verbosity di prod |
| **Log Size** | 10m/50m | 100m/500m | Lebih besar di prod |
| **Restart Policy** | unless-stopped | always | Harus auto-restart |
| **Replicas** | 1 | 2+ | Scale untuk HA |
| **Redis Password** | Tidak ada | HARUS SECURE | Harus set password |

---

## 🔄 File Configuration yang Berubah

### 1. **.env.production** (File Baru)

**Location:** `D:\BMAD-METHOD\dataspace\.env.production`

```bash
# DATABASE
DB_HOST=postgres              # ← Tetap (internal Docker)
DB_NAME=dataspace_prod        # ← UBAH dari dataspace_dev
DB_PASSWORD=SecurePass123!    # ← WAJIB UBAH dari "postgres"

# NODE ENVIRONMENT
NODE_ENV=production           # ← UBAH dari development
LOG_LEVEL=info               # ← UBAH dari debug

# SERVICE URLs - SEMUA UBAH KE IP SERVER
IDP_URL=http://45.158.126.171:3000          # ← UBAH dari localhost
BROKER_URL=http://45.158.126.171:3001       # ← UBAH dari localhost
HUB_URL=http://45.158.126.171:3002          # ← UBAH dari localhost
# ... (semua services)

# REDIS
REDIS_PASSWORD=SecurePass123! # ← WAJIB UBAH (baru)

# KAFKA
KAFKA_BROKERS=kafka:29092     # ← Tetap (internal Docker)
```

### 2. **docker-compose.production.yml** (File Baru)

**Location:** `D:\BMAD-METHOD\dataspace\infra\docker\docker-compose.production.yml`

**Perubahan Kunci:**

#### A. Port Binding - SEBELUM vs SESUDAH

```yaml
# SEBELUM (Development)
ports:
  - "5432:5432"    # Bind ke semua interface (0.0.0.0)

# SESUDAH (Production)
ports:
  - "45.158.126.171:5432:5432"  # Bind ke IP spesifik saja
```

#### B. Environment Variables - SEBELUM vs SESUDAH

```yaml
# SEBELUM
postgres:
  environment:
    POSTGRES_DB: dataspace_dev
    POSTGRES_PASSWORD: postgres

# SESUDAH
postgres:
  environment:
    POSTGRES_DB: ${DB_NAME:-dataspace_prod}
    POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
```

#### C. Logging Configuration

```yaml
# SEBELUM
logging:
  options:
    max-size: "10m"
    max-file: "3"

# SESUDAH
logging:
  options:
    max-size: "100m"    # ← UPGRADE
    max-file: "10"      # ← UPGRADE
```

#### D. Resource Limits

```yaml
# SEBELUM - Minimal
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M

# SESUDAH - Production
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

#### E. Restart Policy

```yaml
# SEBELUM
restart: unless-stopped

# SESUDAH
restart: always    # ← UBAH untuk production
```

#### F. Health Check Intervals

```yaml
# SEBELUM
healthcheck:
  interval: 10s

# SESUDAH
healthcheck:
  interval: 30s     # ← UBAH untuk production
  start_period: 15s # ← TAMBAH
```

#### G. Replicas untuk HA

```yaml
# SEBELUM
# Tidak ada replicas

# SESUDAH
idp:
  deploy:
    replicas: 2    # ← TAMBAH untuk high availability
```

#### H. Traefik Rules

```yaml
# SEBELUM
labels:
  - "traefik.http.routers.idp.rule=Host(`localhost`)"

# SESUDAH
labels:
  - "traefik.http.routers.idp.rule=Host(`45.158.126.171`)"
```

#### I. Redis Configuration

```yaml
# SEBELUM
redis:
  command: redis-server --appendonly yes --requirepass redis_password

# SESUDAH
redis:
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis_password}
```

#### J. Kafka Configuration

```yaml
# SEBELUM (localhost reference)
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://kafka:9092

# SESUDAH (IP reference)
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://45.158.126.171:9092
```

---

## 📊 Detail Perubahan Per Service

### PostgreSQL
```yaml
# Perubahan:
- Environment: dataspace_dev → dataspace_prod
- Password: postgres → ${DB_PASSWORD}
- Port: 5432:5432 → 45.158.126.171:5432:5432
- Resources: 2G mem → 2G mem (unchanged)
```

### Redis
```yaml
# Perubahan:
- Password: none → ${REDIS_PASSWORD}
- Port: 6379:6379 → 45.158.126.171:6379:6379
- Resources: 512M → same
```

### IDP, Broker, Hub, dan semua Services
```yaml
# Perubahan:
- NODE_ENV: development → production
- LOG_LEVEL: debug → info
- DB_NAME: dataspace_dev → dataspace_prod
- Replicas: 1 → 2 (untuk IDP, Broker, Hub, Frontend)
- Port Binding: 3000:3000 → 45.158.126.171:3000:3000
- Restart: unless-stopped → always
```

### Kafka & Zookeeper
```yaml
# Perubahan:
- Port Binding: Add IP address to binding
- Log Retention: Keep same (168 hours)
- Cluster Config: Single broker (production-ready)
```

### Frontend
```yaml
# Perubahan:
- Build Args: NODE_ENV=production, VITE_API_URL=http://45.158.126.171
- Port: 5174:5174 → 45.158.126.171:5174:5174
- Replicas: 2 (untuk load balancing)
- Health Check: Using wget instead of curl
```

### Traefik (API Gateway)
```yaml
# Perubahan:
- Port Binding: 80, 443, 8080 add IP
- Rule: Host(`localhost`) → Host(`45.158.126.171`)
- Certificate: Preparation for SSL/TLS
```

---

## 🔐 Security Changes

### 1. Password Management

```bash
# SEBELUM - Hardcoded defaults
postgres:
  POSTGRES_PASSWORD: postgres

# SESUDAH - Using environment variables
postgres:
  POSTGRES_PASSWORD: ${DB_PASSWORD}
```

**Wajib update:**
- `DB_PASSWORD` → Strong password (min 12 char, mixed case, numbers, symbols)
- `REDIS_PASSWORD` → Strong password
- `JWT_SECRET` → Random string (32+ chars)

### 2. File Permissions

```bash
# SEBELUM - Tidak diatur
.env (readable oleh siapa saja)

# SESUDAH - Restricted
chmod 600 .env.production  # Only owner can read/write
```

### 3. Network Isolation

```bash
# SEBELUM
ports: ["3000:3000"]  # Accessible dari mana saja

# SESUDAH
ports: ["45.158.126.171:3000:3000"]  # Hanya dari server IP
```

---

## 🚀 Migration Checklist

### Pre-Migration
- [ ] Backup database development
- [ ] Verify docker-compose.production.yml syntax
- [ ] Generate strong passwords
- [ ] Test SSH connection ke server
- [ ] Verify disk space di server (50GB+)

### During Migration
- [ ] Update .env.production dengan passwords
- [ ] Copy docker-compose.production.yml
- [ ] Run deploy-linux.sh script
- [ ] Monitor build progress
- [ ] Check health of all services
- [ ] Verify external connectivity

### Post-Migration
- [ ] Verify all services running
- [ ] Test API endpoints
- [ ] Check logs untuk errors
- [ ] Backup production database
- [ ] Setup monitoring
- [ ] Document any customizations

---

## 🔧 Common Customizations

Jika Anda perlu custom configuration, ikuti pattern ini:

### Custom Database Name
```yaml
# Di .env.production
DB_NAME=my_custom_db_prod

# Di docker-compose.production.yml
postgres:
  environment:
    POSTGRES_DB: ${DB_NAME:-dataspace_prod}
```

### Custom Port
```yaml
# Di .env.production
APP_PORT=3000

# Di docker-compose.production.yml
idp:
  ports:
    - "45.158.126.171:${APP_PORT}:3000"
```

### Custom Resources
```yaml
# Di docker-compose.production.yml
idp:
  deploy:
    resources:
      limits:
        cpus: '4'      # Adjust berdasarkan server capacity
        memory: 2G
```

### Custom Service URLs
```yaml
# Di .env.production
IDP_URL=https://api.domain.com/idp  # Gunakan domain jika punya
BROKER_URL=https://api.domain.com/broker
```

---

## 📝 Files to Keep & Update

### Keep (Tetap sama)
- `Dockerfile.service` - Sama untuk dev & prod
- `db/init/*.sql` - Database initialization scripts
- `apps/frontend/Dockerfile` - Frontend build configuration

### Update (Harus diubah)
- `.env.production` - BARU file khusus production
- `docker-compose.production.yml` - BARU file khusus production
- `deploy-linux.sh` - BARU automation script

### Deprecate (Jangan digunakan)
- `.env` - Hanya untuk development lokal
- `docker-compose.dev.yml` - Hanya untuk development
- `docker-compose.yml` (tanpa production) - Deprecated

---

## 🎓 Key Concepts

### Internal vs External DNS

```bash
# INTERNAL (dalam Docker network) - Tetap sama
DB_HOST=postgres          # Service name (DNS resolution)
KAFKA_BROKERS=kafka:29092 # Service name

# EXTERNAL (dari client) - UBAH ke IP
IDP_URL=http://45.158.126.171:3000  # IP address untuk external access
```

### Port Mapping

```bash
# Format: [IP]:HOST_PORT:CONTAINER_PORT
45.158.126.171:3000:3000
└─ Server IP
    └─ Port yang di-listen di server
        └─ Port yang di-listen di container
```

### Environment Variables

```bash
# Variable dari .env.production
${DB_PASSWORD}      # Referensi variable di docker-compose
${LOG_LEVEL}

# Default value jika tidak ada
${DB_PASSWORD:-postgres}  # Gunakan 'postgres' jika DB_PASSWORD tidak set
```

---

## 📚 Reference Files

| File | Lokasi | Status | Notes |
|------|--------|--------|-------|
| .env.production | `D:\BMAD-METHOD\dataspace\` | BARU | Update passwords sebelum deploy |
| docker-compose.production.yml | `infra\docker\` | BARU | Production configuration |
| deploy-linux.sh | `D:\BMAD-METHOD\dataspace\` | BARU | Automated deployment |
| DEPLOYMENT_GUIDE_LINUX.md | `D:\BMAD-METHOD\dataspace\` | BARU | Detailed guide |
| DOCKER_CHANGES_SUMMARY.md | `D:\BMAD-METHOD\dataspace\` | BARU | Ini file (summary) |

---

## ⚠️ Critical Password Fields

**WAJIB GANTI sebelum production:**

1. `.env.production`
   - `DB_PASSWORD` ← Change dari "postgres"
   - `REDIS_PASSWORD` ← Generate new password
   - `JWT_SECRET` ← Generate new random string

2. `docker-compose.production.yml`
   - Harus reference dari `.env.production`
   - Jangan hardcode passwords!

**Contoh Password yang Aman:**
```bash
# Generate dengan openssl (Linux):
openssl rand -base64 32

# Contoh output:
7x!A@5mK#9qL$2bC&8nR^0pQ(3sT%7vW

# Atau gunakan password manager
```

---

## 🔗 Related Documents

- **DEPLOYMENT_GUIDE_LINUX.md** - Detailed step-by-step deployment guide
- **deploy-linux.sh** - Automated deployment script
- **.env.production** - Production environment configuration
- **docker-compose.production.yml** - Production compose file

---

## ✅ Verification Commands

Setelah deployment, jalankan commands ini untuk verify:

```bash
# 1. Check containers running
docker-compose -f infra/docker/docker-compose.production.yml ps

# 2. Check service health
curl http://45.158.126.171:3000/health

# 3. Check database
docker exec dataspace-postgres-prod pg_isready -U postgres

# 4. Check logs
docker-compose -f infra/docker/docker-compose.production.yml logs -f

# 5. Check disk usage
df -h /opt/dataspace
```

---

**Status:** ✅ Ready for Production Deployment
**Last Updated:** 2024-11-28
**Version:** 1.0
