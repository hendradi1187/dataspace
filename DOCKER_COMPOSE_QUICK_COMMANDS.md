# Docker Compose Quick Commands Reference

## 🚀 START FULL STACK

### Windows
```powershell
.\start-docker-compose.bat start
```

### Linux/macOS
```bash
chmod +x start-docker-compose.sh
./start-docker-compose.sh start
```

### Manual (All Platforms)
```bash
cd infra/docker
docker-compose -f docker-compose.yml --env-file ../../.env.docker-compose up --build
```

---

## 📋 LOGS & MONITORING

```bash
# View all logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f idp
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs -f --tail=50

# Search logs for errors
docker-compose logs | grep ERROR

# Timestamp
docker-compose logs --timestamps
```

---

## 📊 STATUS & HEALTH

```bash
# List all containers and status
docker-compose ps

# Resource usage
docker stats

# Specific container health
docker-compose exec postgres pg_isready -U postgres
```

---

## ⏸️ STOP/RESTART

```bash
# Stop all services (keep data)
docker-compose stop
docker-compose down

# Stop and delete data
docker-compose down -v

# Stop specific service
docker-compose stop frontend

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart idp
```

---

## 🔧 SHELL & COMMANDS

```bash
# Get shell in container
docker-compose exec frontend sh
docker-compose exec postgres bash

# Run one-off command
docker-compose exec frontend npm list
docker-compose exec postgres psql -U postgres -d dataspace_prod

# Run without allocating TTY
docker-compose exec -T postgres pg_dump -U postgres dataspace_prod > backup.sql
```

---

## 🗄️ DATABASE

### Via Adminer (Web)
- URL: http://localhost:8080
- Server: postgres
- User: postgres
- Password: postgres
- Database: dataspace_prod

### Via psql (CLI)
```bash
# Connect
docker-compose exec postgres psql -U postgres -d dataspace_prod

# Commands:
\dt                      # List tables
\d table_name           # Describe table
SELECT * FROM users;    # Query
\q                      # Exit
```

### Backup & Restore
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres dataspace_prod > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres dataspace_prod < backup.sql
```

---

## 🔄 UPDATE & REBUILD

```bash
# Pull latest images
docker-compose pull

# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## 🧹 CLEANUP

```bash
# Remove stopped containers
docker-compose rm

# Remove containers and data
docker-compose down -v

# Remove unused images
docker image prune

# Complete cleanup (removes everything!)
docker system prune -a --volumes
```

---

## 🔗 ACCESS POINTS

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 5174 | http://localhost:5174 |
| IDP | 3000 | http://localhost:3000 |
| Broker | 3001 | http://localhost:3001 |
| Hub | 3002 | http://localhost:3002 |
| Policy | 3003 | http://localhost:3003 |
| Contract | 3004 | http://localhost:3004 |
| Compliance | 3005 | http://localhost:3005 |
| Ledger | 3006 | http://localhost:3006 |
| Clearing | 3007 | http://localhost:3007 |
| AppStore | 3008 | http://localhost:3008 |
| Connector | 3009 | http://localhost:3009 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Kafka | 9092 | localhost:9092 |
| Adminer | 8080 | http://localhost:8080 |

---

## 🆘 TROUBLESHOOTING

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr 5174          # Windows
lsof -i :5174                        # macOS/Linux

# Kill process (Windows)
taskkill /PID <PID> /F

# Change port in docker-compose.yml
# ports:
#   - "15174:5174"
```

### Service Not Starting
```bash
# Check logs
docker-compose logs frontend

# Restart
docker-compose restart frontend

# Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Database Connection Failed
```bash
# Check postgres health
docker-compose exec postgres pg_isready -U postgres

# View postgres logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
docker-compose up -d
```

### Memory Issues
```bash
# Check usage
docker stats

# Reduce container limits or increase Docker memory allocation
# Docker Desktop > Preferences > Resources > Memory
```

---

## 📁 COMMON PATHS

| Item | Path |
|------|------|
| Docker Compose Config | `infra/docker/docker-compose.yml` |
| Frontend Override | `infra/docker/docker-compose.dev.5174.yml` |
| Environment File | `.env.docker-compose` |
| Startup Script (Windows) | `start-docker-compose.bat` |
| Startup Script (Linux) | `start-docker-compose.sh` |
| Full Documentation | `FULL_STACK_DOCKER_COMPOSE.md` |

---

## 💡 TIPS

1. **Use startup script** for automated setup:
   ```bash
   ./start-docker-compose.sh start
   ```

2. **Always backup data** before `down -v`:
   ```bash
   docker-compose exec postgres pg_dump -U postgres dataspace_prod > backup.sql
   ```

3. **View real-time logs** while developing:
   ```bash
   docker-compose logs -f
   ```

4. **Keep services in background**:
   ```bash
   docker-compose up -d
   ```

5. **Update .env.docker-compose** for external IPs:
   ```bash
   # Change from localhost to actual server IP
   VITE_API_URL=http://45.158.126.171
   IDP_URL=http://45.158.126.171:3000
   ```

---

## 📞 GETTING HELP

```bash
# See all docker-compose commands
docker-compose --help

# See specific command help
docker-compose up --help
docker-compose logs --help

# Check docker version
docker --version
docker-compose --version
```

---

Last Updated: 2025-11-28
Full Documentation: `FULL_STACK_DOCKER_COMPOSE.md`
