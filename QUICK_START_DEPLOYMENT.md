# 🚀 Quick Start - Deploy ke Linux Server (5 Minutes)

## Langkah Cepat Deployment

### 1️⃣ Update Password (2 menit)

```bash
# Buka file .env.production dengan editor teks
# Ganti PASSWORD dengan yang aman:

DB_PASSWORD=YourSecurePassword123!
REDIS_PASSWORD=YourSecurePassword456!
JWT_SECRET=YourRandomString789012345678901234567890
```

### 2️⃣ Run Deployment Script (15-30 menit)

```bash
cd D:\BMAD-METHOD\dataspace

# Jalankan automated deployment
bash deploy-linux.sh

# Script akan:
# - Validasi konfigurasi
# - Copy files ke server
# - Build Docker images
# - Start containers
# - Run health checks
```

### 3️⃣ Verify Deployment (2 menit)

```bash
# Test akses dari browser atau curl
curl http://45.158.126.171:3000/health    # IDP
curl http://45.158.126.171:3001/health    # Broker
curl http://45.158.126.171:5174           # Frontend

# Atau buka di browser:
http://45.158.126.171:5174
```

---

## 📊 Hasil Akhir

**Jika sukses, Anda akan lihat:**

```
✓ All services running
✓ All health checks passed
✓ Database ready
✓ Redis cache ready
✓ Kafka broker ready

Access Services:
  Frontend:   http://45.158.126.171:5174
  IDP:        http://45.158.126.171:3000
  Broker:     http://45.158.126.171:3001
  Hub:        http://45.158.126.171:3002
  Kafka UI:   http://45.158.126.171:8080
```

---

## 🆘 Jika Ada Error

### Error 1: "Cannot connect to server"
```bash
# Check SSH access
ssh dt-admin@45.158.126.171 echo "OK"
```

### Error 2: "docker-compose command not found"
```bash
# Install di server
ssh dt-admin@45.158.126.171 sudo apt-get install docker-compose
```

### Error 3: "Permission denied"
```bash
# Fix docker permissions
ssh dt-admin@45.158.126.171 sudo usermod -aG docker dt-admin
```

### Error 4: "Port already in use"
```bash
# Restart docker-compose
ssh dt-admin@45.158.126.171 << 'EOF'
cd /opt/dataspace
docker-compose -f infra/docker/docker-compose.production.yml restart
EOF
```

---

## 📚 Dokumentasi Lengkap

Lihat file-file ini untuk detail lebih lanjut:

| File | Isi |
|------|-----|
| `DEPLOYMENT_GUIDE_LINUX.md` | Step-by-step lengkap + troubleshooting |
| `DOCKER_CHANGES_SUMMARY.md` | Semua perubahan Docker configuration |
| `.env.production` | Environment variables production |
| `deploy-linux.sh` | Automated deployment script |

---

## ⏱️ Timeline Deployment

```
Total: ~20-45 menit

1. Pre-checks:        1-2 menit
2. File copy:         2-5 menit (tergantung network)
3. Docker build:     10-30 menit (tergantung server)
4. Health checks:     1-2 menit
5. Verification:      1 menit
```

---

## ✅ Deployment Checklist

- [ ] Update passwords di .env.production
- [ ] Run `bash deploy-linux.sh`
- [ ] Wait untuk completion
- [ ] Test akses services
- [ ] Check logs untuk errors
- [ ] Setup monitoring (optional)

---

## 🔒 Security Checklist

- [ ] Changed DB_PASSWORD
- [ ] Changed REDIS_PASSWORD
- [ ] Changed JWT_SECRET
- [ ] Set .env permissions to 600

---

## 📞 Bantuan

Jika ada masalah:

1. **Check logs:**
   ```bash
   ssh dt-admin@45.158.126.171 << 'EOF'
   cd /opt/dataspace
   docker-compose -f infra/docker/docker-compose.production.yml logs -f
   EOF
   ```

2. **Restart services:**
   ```bash
   ssh dt-admin@45.158.126.171 << 'EOF'
   cd /opt/dataspace
   docker-compose -f infra/docker/docker-compose.production.yml restart
   EOF
   ```

3. **Read full guide:**
   Buka `DEPLOYMENT_GUIDE_LINUX.md`

---

**Status:** Ready to deploy! 🎉
