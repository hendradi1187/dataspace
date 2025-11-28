# Panduan Deployment Dataspace ke Linux Server (45.158.126.171)

## 📋 Daftar Isi

1. [Ringkasan Perubahan Docker](#ringkasan-perubahan-docker)
2. [Prasyarat](#prasyarat)
3. [Persiapan Lokal](#persiapan-lokal)
4. [Deployment Otomatis](#deployment-otomatis)
5. [Deployment Manual](#deployment-manual)
6. [Verifikasi Deployment](#verifikasi-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## 🔧 Ringkasan Perubahan Docker

Saat migrasi dari Windows (lokal) ke Linux Server, berikut perubahan konfigurasi Docker yang **WAJIB** dilakukan:

### 1. **Environment Variables (.env)**

#### Perubahan Utama:
```bash
# SEBELUM (Development/Windows)
DB_HOST=localhost
NODE_ENV=development
IDP_URL=http://localhost:3000
LOG_LEVEL=debug

# SESUDAH (Production/Linux Server)
DB_HOST=postgres              # Tetap localhost (internal Docker)
NODE_ENV=production           # UBAH ke production
IDP_URL=http://45.158.126.171:3000  # UBAH ke IP server
LOG_LEVEL=info               # UBAH dari debug
```

### 2. **Database Configuration**

```yaml
# Perubahan pada docker-compose.yml
postgres:
  environment:
    DB_NAME: dataspace_prod    # Ubah dari dataspace_dev
    DB_PASSWORD: <SECURE_PASS> # WAJIB ubah password
  ports:
    - "45.158.126.171:5432:5432"  # Bind ke IP spesifik
```

### 3. **Port Binding**

**Perubahan Signifikan:**
```yaml
# SEBELUM - Bind ke semua interface
ports:
  - "3000:3000"

# SESUDAH - Bind ke IP server spesifik
ports:
  - "45.158.126.171:3000:3000"
```

**Alasan:** Pada production, lebih aman untuk hanya expose ke IP server yang spesifik.

### 4. **Resource Limits**

```yaml
# Sesuaikan dengan kapasitas server Linux
deploy:
  resources:
    limits:
      cpus: '4'        # Tergantung CPU server
      memory: 4G       # Tergantung RAM server
```

### 5. **Reverse Proxy (Traefik)**

```yaml
# Perubahan hosts di Traefik labels
traefik:
  labels:
    # SEBELUM
    - "traefik.http.routers.idp.rule=Host(`localhost`)"

    # SESUDAH
    - "traefik.http.routers.idp.rule=Host(`45.158.126.171`)"
```

### 6. **Logging Configuration**

```yaml
# Sesuaikan untuk production
logging:
  driver: "json-file"
  options:
    max-size: "100m"   # Upgrade dari 50m
    max-file: "10"     # Upgrade dari 5
```

### 7. **Service URLs**

Semua service harus menggunakan IP server, bukan localhost:

```env
# File: .env.production
IDP_URL=http://45.158.126.171:3000
BROKER_URL=http://45.158.126.171:3001
HUB_URL=http://45.158.126.171:3002
POLICY_URL=http://45.158.126.171:3003
# ... dan seterusnya untuk semua services
```

### 8. **Restart Policy**

```yaml
# Production harus menggunakan "always"
restart: always    # Bukan "unless-stopped"
```

### 9. **Volumes Path**

```yaml
# Di Linux server, gunakan path absolut
volumes:
  postgres_data_prod:
    driver: local
    driver_opts:
      device: /opt/dataspace/postgres_data
```

### 10. **Environment Variables untuk Services**

```yaml
# Semua services perlu konfigurasi production
idp:
  environment:
    NODE_ENV: production      # UBAH dari development
    LOG_LEVEL: info          # UBAH dari debug
    DB_HOST: postgres        # Tetap (internal Docker DNS)
    REDIS_HOST: redis        # Tetap (internal Docker DNS)
    KAFKA_BROKERS: kafka:29092  # Tetap (internal Docker DNS)
```

---

## ✅ Prasyarat

### Di Server Linux (45.158.126.171):

1. **Docker & Docker Compose**
   ```bash
   # Check installation
   docker --version      # Harus v20.10+
   docker-compose --version  # Harus v1.29+
   ```

2. **User Permissions**
   ```bash
   # Pastikan dt-admin bisa menjalankan docker
   sudo usermod -aG docker dt-admin
   ```

3. **Disk Space**
   - Minimal 50GB untuk data dan logs
   - Recommended: 100GB

4. **Memory**
   - Minimal 4GB RAM
   - Recommended: 8GB+ untuk production

5. **Network**
   - Port 3000-3011 terbuka (services)
   - Port 5174 terbuka (frontend)
   - Port 8080, 8081 (monitoring)

---

## 📦 Persiapan Lokal

### Step 1: Duplikasi File Konfigurasi

```bash
cd D:\BMAD-METHOD\dataspace

# File sudah dibuat oleh deployment system:
# ✓ .env.production
# ✓ infra/docker/docker-compose.production.yml
# ✓ deploy-linux.sh
```

### Step 2: Update .env.production

**KRITIS - Ubah Password di File Ini:**

```bash
# Edit .env.production dengan editor teks
# Ganti semua password default dengan password yang aman:

DB_PASSWORD=UbahDenganPasswordYangAman!       # ← WAJIB UBAH
REDIS_PASSWORD=UbahDenganPasswordYangAman!   # ← WAJIB UBAH
JWT_SECRET=UbahDenganStringRandomAman123456! # ← WAJIB UBAH
```

**Contoh Password Aman:**
```bash
# Generate password aman (Linux):
openssl rand -base64 32

# Atau gunakan password manager untuk create password
```

### Step 3: Validasi Konfigurasi Lokal

```bash
# Gunakan docker-compose untuk validasi syntax
docker-compose -f infra/docker/docker-compose.production.yml config

# Output harus menunjukkan full YAML tanpa error
```

### Step 4: Berikan Izin Execute pada Script

```bash
# Windows (PowerShell):
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser

# Atau gunakan bash shell langsung:
chmod +x deploy-linux.sh
```

---

## 🚀 Deployment Otomatis

### Metode Tercepat - Gunakan Script

```bash
cd D:\BMAD-METHOD\dataspace

# Jalankan deployment script
bash deploy-linux.sh
```

**Apa yang dilakukan script:**

1. ✓ Validasi file konfigurasi lokal
2. ✓ Test koneksi SSH ke server
3. ✓ Membuat direktori di server Linux
4. ✓ Copy semua file project ke server
5. ✓ Copy file .env.production (dengan chmod 600)
6. ✓ Build Docker images di server
7. ✓ Start semua containers
8. ✓ Perform health checks
9. ✓ Tampilkan informasi akses services

**Waktu Estimasi:** 15-30 menit (tergantung kecepatan network & server)

### Monitoring Deployment

Saat script berjalan:

```bash
# Di terminal lain, SSH ke server untuk lihat progress
ssh dt-admin@45.158.126.171

# Check Docker build progress
docker ps -a
docker images

# Check logs
docker-compose -f /opt/dataspace/infra/docker/docker-compose.production.yml logs -f
```

---

## 📝 Deployment Manual (Step-by-Step)

Jika script tidak berhasil atau Anda ingin lebih kontrol:

### Step 1: SSH ke Server

```bash
ssh dt-admin@45.158.126.171
```

### Step 2: Persiapan Direktori

```bash
# Create folder structure
mkdir -p /opt/dataspace
mkdir -p /opt/dataspace/{postgres_data,redis_data,logs}

# Set proper permissions
chmod 700 /opt/dataspace
chmod 700 /opt/dataspace/{postgres_data,redis_data,logs}

# Verify
ls -la /opt/dataspace
```

### Step 3: Copy Files dari Lokal

Dari terminal lokal (Windows):

```bash
# Copy semua project files kecuali yang tidak perlu
rsync -av ^
  --exclude='.git' ^
  --exclude='node_modules' ^
  --exclude='dist' ^
  --exclude='build' ^
  --exclude='.env' ^
  --exclude='*.log' ^
  D:\BMAD-METHOD\dataspace\ ^
  dt-admin@45.158.126.171:/opt/dataspace/

# ATAU gunakan SCP untuk simplicity:
scp -r D:\BMAD-METHOD\dataspace\* dt-admin@45.158.126.171:/opt/dataspace/
```

### Step 4: Copy Environment File

```bash
# Copy dengan secure permissions
scp .env.production dt-admin@45.158.126.171:/opt/dataspace/.env

# Set permissions (dari server):
ssh dt-admin@45.158.126.171 'chmod 600 /opt/dataspace/.env'

# Verify (optional)
ssh dt-admin@45.158.126.171 'ls -la /opt/dataspace/.env'
```

### Step 5: Build Docker Images (Di Server)

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace

# Validate docker-compose
docker-compose -f infra/docker/docker-compose.production.yml config

# Build images (LAMA - 15-30 menit)
docker-compose -f infra/docker/docker-compose.production.yml build

# Atau build tanpa cache:
docker-compose -f infra/docker/docker-compose.production.yml build --no-cache
EOF
```

### Step 6: Deploy Services

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace

# Start all services
docker-compose -f infra/docker/docker-compose.production.yml up -d

# Check status
docker-compose -f infra/docker/docker-compose.production.yml ps

# View logs
docker-compose -f infra/docker/docker-compose.production.yml logs -f
EOF
```

---

## ✔️ Verifikasi Deployment

### 1. Check Container Status

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace
docker-compose -f infra/docker/docker-compose.production.yml ps

# Output harus menampilkan semua containers dengan status "Up"
EOF
```

### 2. Check Service Health

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
echo "Checking IDP..."
curl -s http://localhost:3000/health | jq .

echo "Checking Broker..."
curl -s http://localhost:3001/health | jq .

echo "Checking Hub..."
curl -s http://localhost:3002/health | jq .

echo "Checking Database..."
docker exec dataspace-postgres-prod pg_isready -U postgres

echo "Checking Redis..."
docker exec dataspace-redis-prod redis-cli ping
EOF
```

### 3. Test External Access

```bash
# Dari komputer lokal, test akses ke server
curl http://45.158.126.171:3000/health
curl http://45.158.126.171:3001/health

# Atau buka di browser:
# http://45.158.126.171:5174 (Frontend)
# http://45.158.126.171:8081 (Traefik Dashboard)
```

### 4. Check Logs untuk Errors

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace

# Follow logs (Ctrl+C untuk stop)
docker-compose -f infra/docker/docker-compose.production.yml logs -f

# Atau lihat logs spesifik service
docker-compose -f infra/docker/docker-compose.production.yml logs idp
docker-compose -f infra/docker/docker-compose.production.yml logs postgres
EOF
```

---

## 🔍 Troubleshooting

### Problem 1: "Connection refused" ke services

```bash
# Solusi 1: Tunggu services startup (bisa ambil 2-3 menit)
sleep 60
curl http://45.158.126.171:3000/health

# Solusi 2: Check jika container running
docker-compose -f infra/docker/docker-compose.production.yml ps

# Solusi 3: Lihat logs untuk error
docker-compose -f infra/docker/docker-compose.production.yml logs idp
```

### Problem 2: "Database connection failed"

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
# Check PostgreSQL health
docker exec dataspace-postgres-prod pg_isready -U postgres

# Check env variables di container
docker exec dataspace-idp-prod env | grep DB_

# Check network
docker network ls
docker inspect dataspace-net
EOF
```

### Problem 3: "Out of memory" errors

```bash
# Check memory usage
docker stats

# Reduce resource limits di docker-compose.production.yml
# Atau tambah RAM ke server
```

### Problem 4: "Permission denied" untuk volumes

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
# Fix permissions
sudo chown dt-admin:dt-admin /opt/dataspace -R
chmod 700 /opt/dataspace/{postgres_data,redis_data,logs}

# Restart containers
docker-compose -f infra/docker/docker-compose.production.yml restart
EOF
```

### Problem 5: Port sudah digunakan

```bash
# Check port yang listening
netstat -tuln | grep LISTEN

# Kill process yang menggunakan port
sudo fuser -k 3000/tcp
sudo fuser -k 5432/tcp

# Restart docker-compose
docker-compose -f infra/docker/docker-compose.production.yml restart
```

---

## 🛠️ Maintenance

### Daily Tasks

```bash
# Check service health
ssh dt-admin@45.158.126.171 << 'EOF'
curl -s http://localhost:3000/health
curl -s http://localhost:3001/health
curl -s http://localhost:5174/
EOF

# Check disk usage
ssh dt-admin@45.158.126.171 df -h /opt/dataspace
```

### Weekly Tasks

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace

# Check logs untuk warnings/errors
docker-compose -f infra/docker/docker-compose.production.yml logs --tail=100

# Prune unused Docker resources
docker system prune -f
EOF
```

### Monthly Tasks

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace

# Backup database
docker exec dataspace-postgres-prod pg_dump -U postgres dataspace_prod \
  > /opt/dataspace/backups/dataspace_prod_$(date +%Y%m%d).sql

# Update Docker images
docker-compose -f infra/docker/docker-compose.production.yml pull
docker-compose -f infra/docker/docker-compose.production.yml up -d
EOF
```

### Backup Database

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
mkdir -p /opt/dataspace/backups

# Backup ke file
docker exec dataspace-postgres-prod pg_dump \
  -U postgres \
  dataspace_prod > \
  /opt/dataspace/backups/dataspace_prod_$(date +%Y%m%d_%H%M%S).sql

# Compress untuk save disk
gzip /opt/dataspace/backups/dataspace_prod_*.sql

# List backups
ls -lh /opt/dataspace/backups/
EOF
```

### Restore Database

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
# Stop services
docker-compose -f /opt/dataspace/infra/docker/docker-compose.production.yml down

# Restore dari backup
gunzip -c /opt/dataspace/backups/dataspace_prod_20240101.sql.gz | \
  docker exec -i dataspace-postgres-prod psql -U postgres

# Restart services
docker-compose -f /opt/dataspace/infra/docker/docker-compose.production.yml up -d
EOF
```

### Update Service Configuration

Jika perlu update .env atau docker-compose:

```bash
# 1. Update file lokal
# 2. Copy ke server
scp .env.production dt-admin@45.158.126.171:/opt/dataspace/.env

# 3. Restart services
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace
docker-compose -f infra/docker/docker-compose.production.yml restart
EOF
```

### Scale Services

Untuk tingkatkan replicas:

```bash
# Edit docker-compose.production.yml
# Ubah deploy.replicas untuk service tertentu

# Contoh - Scale IDP ke 3 replicas
# idp:
#   deploy:
#     replicas: 3

# Restart
docker-compose -f infra/docker/docker-compose.production.yml up -d
```

---

## 📊 Monitoring & Debugging

### Real-time Logs

```bash
# All services
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace
docker-compose -f infra/docker/docker-compose.production.yml logs -f
EOF

# Specific service
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace
docker-compose -f infra/docker/docker-compose.production.yml logs -f idp
EOF
```

### System Resources

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
# CPU & Memory usage
docker stats

# Disk usage
du -sh /opt/dataspace/*

# Network stats
docker inspect dataspace-net
EOF
```

### Container Exec

```bash
ssh dt-admin@45.158.126.171 << 'EOF'
# Access database
docker exec -it dataspace-postgres-prod psql -U postgres -d dataspace_prod

# Check service environment
docker exec dataspace-idp-prod env

# Run shell di container
docker exec -it dataspace-idp-prod /bin/sh
EOF
```

---

## 🔒 Security Notes

1. **Change Passwords:**
   - Update DB_PASSWORD di .env.production
   - Update REDIS_PASSWORD di .env.production
   - Update JWT_SECRET

2. **File Permissions:**
   ```bash
   chmod 600 /opt/dataspace/.env
   chmod 600 /opt/dataspace/.env.production
   ```

3. **Firewall Rules:**
   - Hanya expose ports yang diperlukan
   - Gunakan IP whitelist jika possible
   - Pertimbangkan VPN atau SSH tunneling

4. **SSL/TLS:**
   - Implementasikan HTTPS di production
   - Update traefik.yml untuk SSL configuration
   - Gunakan Let's Encrypt atau certificate yang valid

5. **Monitoring:**
   - Setup log aggregation (ELK Stack, Prometheus)
   - Monitor disk space dan memory
   - Setup alerts untuk service failures

---

## 📞 Support & Next Steps

Jika ada yang tidak berhasil:

1. **Check logs:** `docker-compose logs -f`
2. **Verify configuration:** `docker-compose config`
3. **Check network:** `docker network inspect dataspace-net`
4. **Restart service:** `docker-compose restart [service-name]`

---

## 📅 Checklist Deployment

- [ ] Update .env.production dengan password yang aman
- [ ] Validate docker-compose.production.yml
- [ ] Test SSH connection ke server
- [ ] Run deploy-linux.sh atau manual deployment
- [ ] Verify semua containers running
- [ ] Test external access ke services
- [ ] Check logs untuk errors
- [ ] Setup monitoring dan backup
- [ ] Document custom configurations
- [ ] Create runbook untuk maintenance

---

**Last Updated:** 2024-11-28
**Version:** 1.0
**Status:** Production Ready
