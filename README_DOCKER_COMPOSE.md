# 🚀 Full Stack Docker Compose - Getting Started

## Quick Start (Choose One)

### ⚡ **Option 1: Windows - Fastest**
```powershell
# From project root, simply run:
.\start-docker-compose.bat start

# That's it! Everything will start automatically
```

### ⚡ **Option 2: Linux/macOS - Fastest**
```bash
# From project root:
chmod +x start-docker-compose.sh
./start-docker-compose.sh start

# Everything starts automatically
```

### ⚡ **Option 3: Manual Command**
```bash
cd infra/docker

# Start full stack
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up --build

# Or in background
docker-compose -f docker-compose.yml \
  --env-file ../../.env.docker-compose \
  up --build -d
```

---

## 🎯 What Gets Started

When you run the startup script, these services automatically start:

### Frontend
- ✅ **Frontend UI** on http://localhost:5174
  - React + Vite production build
  - Fully optimized & minified

### Microservices (11 Services)
- ✅ IDP (Identity Provider) - Port 3000
- ✅ Broker - Port 3001
- ✅ Hub - Port 3002
- ✅ Policy (TrustCore) - Port 3003
- ✅ Contract (TrustCore) - Port 3004
- ✅ Compliance (TrustCore) - Port 3005
- ✅ Ledger (TrustCore) - Port 3006
- ✅ Clearing (CTS) - Port 3007
- ✅ AppStore - Port 3008
- ✅ Connector - Port 3009
- ✅ Clearing (TrustCore) - Port 3010
- ✅ Connector (TrustCore) - Port 3011

### Infrastructure
- ✅ **PostgreSQL** - Port 5432 (Database)
- ✅ **Redis** - Port 6379 (Cache)
- ✅ **Kafka** - Port 9092 (Message Queue)
- ✅ **Zookeeper** - Port 2181 (Kafka Coordinator)
- ✅ **Adminer** - http://localhost:8080 (DB Management)

---

## 📝 First Time Setup

### 1. Prerequisites Check
Ensure you have:
- Docker Desktop installed
- Docker Compose installed
- 8GB+ RAM available
- 20GB+ disk space

Verify:
```bash
docker --version
docker-compose --version
```

### 2. Environment Configuration
The script automatically creates `.env.docker-compose` from `.env.production`

If you need to customize:
```bash
# Edit environment variables
nano .env.docker-compose

# Or use template
cp .env.production .env.docker-compose
```

### 3. Start Full Stack
```powershell
# Windows
.\start-docker-compose.bat start

# Or Linux/macOS
./start-docker-compose.sh start
```

### 4. Wait for Startup
- Initial build takes **5-10 minutes** on first run
- Subsequent starts are much faster
- Script shows progress and status

### 5. Access Services
Once started, you can access:

**Frontend:**
- http://localhost:5174 ← **Main application**

**Database:**
- http://localhost:8080 (Adminer)
- Username: postgres
- Password: postgres

**Microservices** (for testing):
- http://localhost:3000/health (IDP)
- http://localhost:3001/health (Broker)
- etc.

---

## 🎮 Common Commands

### View What's Running
```powershell
# Windows
docker-compose -f infra/docker/docker-compose.yml ps

# Linux/macOS
docker-compose -f infra/docker/docker-compose.yml ps
```

### View Live Logs
```bash
# All services
docker-compose -f infra/docker/docker-compose.yml logs -f

# Specific service
docker-compose -f infra/docker/docker-compose.yml logs -f frontend
docker-compose -f infra/docker/docker-compose.yml logs -f idp
```

### Stop Everything
```bash
# Stop but keep data
docker-compose -f infra/docker/docker-compose.yml down

# Stop and delete all data
docker-compose -f infra/docker/docker-compose.yml down -v
```

### Restart a Service
```bash
docker-compose -f infra/docker/docker-compose.yml restart frontend
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README_DOCKER_COMPOSE.md** | This file - Getting started |
| **FULL_STACK_DOCKER_COMPOSE.md** | Complete detailed guide |
| **DOCKER_COMPOSE_QUICK_COMMANDS.md** | Command reference |
| **start-docker-compose.sh** | Linux/macOS startup script |
| **start-docker-compose.bat** | Windows startup script |

---

## 🔧 Configuration Files

### `.env.docker-compose`
Environment variables for Docker Compose
- Database credentials
- Service URLs (uses internal names: idp, broker, etc.)
- API configuration

### `infra/docker/docker-compose.yml`
Main compose configuration
- All service definitions
- Port mappings
- Volume management
- Network setup

### `infra/docker/docker-compose.dev.5174.yml`
Frontend override for port 5174
- Frontend service config
- Environment variables
- Build arguments

---

## 🚨 Troubleshooting

### **Issue: Port Already in Use**
```bash
# Find what's using port 5174
netstat -ano | findstr 5174      # Windows
lsof -i :5174                    # macOS/Linux

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or edit docker-compose.yml to use different port
```

### **Issue: Services Not Starting**
```bash
# Check logs
docker-compose -f infra/docker/docker-compose.yml logs frontend

# Rebuild without cache
docker-compose -f infra/docker/docker-compose.yml build --no-cache
docker-compose -f infra/docker/docker-compose.yml up -d
```

### **Issue: Database Connection Error**
```bash
# Check postgres health
docker-compose -f infra/docker/docker-compose.yml exec postgres pg_isready

# Restart postgres
docker-compose -f infra/docker/docker-compose.yml restart postgres
```

### **Issue: Out of Memory**
```bash
# Check resource usage
docker stats

# Docker Desktop: Preferences > Resources > Increase Memory
```

### **Issue: Frontend Shows Errors**
```bash
# Check browser console for error messages
# Verify microservices are running
docker-compose -f infra/docker/docker-compose.yml ps

# Restart frontend
docker-compose -f infra/docker/docker-compose.yml restart frontend
```

---

## 📊 Database Access

### Via Web (Adminer)
1. Open http://localhost:8080
2. Login:
   - Server: postgres
   - User: postgres
   - Password: postgres
   - Database: dataspace_prod

### Via Command Line
```bash
# Connect to database
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -d dataspace_prod

# Common commands in psql
\dt              # List all tables
SELECT * FROM users;  # Query data
\q              # Exit
```

### Backup Database
```bash
# Create backup
docker-compose -f infra/docker/docker-compose.yml exec postgres pg_dump -U postgres dataspace_prod > backup.sql

# Restore from backup
docker-compose -f infra/docker/docker-compose.yml exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

---

## 🔐 Security Notes

### For Development (Current)
```
DB_PASSWORD=postgres
REDIS_PASSWORD=redis_password
JWT_SECRET=changeme
```

### For Production
Change in `.env.docker-compose` or `.env.production`:
```
DB_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
JWT_SECRET=<random-64-chars>

# Also update service URLs to use actual IP:
VITE_API_URL=http://45.158.126.171
IDP_URL=http://45.158.126.171:3000
# ... etc
```

---

## 📈 Performance Tips

1. **Use startup script** - It handles all optimization
2. **Allocate 8GB+ RAM** to Docker
3. **Use SSD** for better performance
4. **Don't run other heavy apps** while testing
5. **Keep Docker images updated** with `docker-compose pull`

---

## 🆘 Getting Help

### Check Startup Script Status
```powershell
# Windows
.\start-docker-compose.bat ps      # Show running services
.\start-docker-compose.bat logs    # View logs

# Linux/macOS
./start-docker-compose.sh ps
./start-docker-compose.sh logs
```

### View Complete Documentation
- Detailed guide: `FULL_STACK_DOCKER_COMPOSE.md`
- Command reference: `DOCKER_COMPOSE_QUICK_COMMANDS.md`

### Manual Docker Compose
```bash
cd infra/docker
docker-compose --help
docker-compose ps --help
docker-compose logs --help
```

---

## ✅ Next Steps

1. **Start full stack**:
   ```powershell
   .\start-docker-compose.bat start
   ```

2. **Open frontend**:
   - http://localhost:5174

3. **Test all buttons** in the UI (same as port 5173 but production build)

4. **Access database**:
   - http://localhost:8080

5. **Check microservices**:
   - http://localhost:3000/health (should return success)

6. **View logs if needed**:
   ```bash
   docker-compose -f infra/docker/docker-compose.yml logs -f
   ```

---

## 📝 Summary

| Item | Value |
|------|-------|
| Frontend URL | http://localhost:5174 |
| Database | PostgreSQL on localhost:5432 |
| Admin UI | http://localhost:8080 |
| Microservices | Ports 3000-3011 |
| Setup Time | 5-10 min (first time) |
| Setup Time | <1 min (subsequent) |

**You're ready to go!** 🎉

---

**Questions?** See the detailed guides or documentation in the repo.
