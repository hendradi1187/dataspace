# Diagnose Service Errors

The services are starting but failing health checks. We need to see the actual error messages.

## Get Service Logs (Run on Server)

### View IDP Logs
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs idp --tail=100
```

### View All Service Logs
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs --tail=200
```

### Follow Logs in Real-Time
```bash
docker-compose -f infra/docker/docker-compose.production.yml logs -f
# Press Ctrl+C to stop
```

### Check Specific Service Status
```bash
docker-compose -f infra/docker/docker-compose.production.yml ps

# Or check individual container
docker ps | grep idp
docker logs CONTAINER_ID
```

## Common Issues to Check

### 1. Database Connection Failure
**Look for:** "Failed to connect to database" or "Connection refused"
**Solution:** Check if postgres is running and healthy:
```bash
docker-compose -f infra/docker/docker-compose.production.yml ps postgres
# Should show: Up (healthy)
```

### 2. Module Import Error
**Look for:** "Cannot find module" or "ERR_MODULE_NOT_FOUND"
**Solution:** Check if workspace symlinks are created:
```bash
docker-compose -f infra/docker/docker-compose.production.yml exec idp ls -la /app/node_modules/@dataspace/
# Should show symlinks to libs
```

### 3. Missing Environment Variables
**Look for:** "undefined is not a valid" or "Cannot read property"
**Solution:** Check .env file:
```bash
cat .env.docker-compose
# Verify all DB_*, REDIS_*, KAFKA_* variables are set
```

### 4. Health Check Timeout
**Look for:** Container keeps restarting
**Solution:** Logs might show service is starting but health check times out:
```bash
# Check if service is actually responding
docker-compose -f infra/docker/docker-compose.production.yml exec idp curl http://localhost:3000/health
# If this works, increase health check timeout in docker-compose.production.yml
```

## Next Steps

1. **Run one of the log commands above**
2. **Share the output** - That will tell us exactly what's failing
3. **We'll fix it based on the actual error**

The error message is key to solving this!

