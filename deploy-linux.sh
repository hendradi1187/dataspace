#!/bin/bash

################################################################################
# Dataspace Deployment Script for Linux Server (45.158.126.171)
# User: dt-admin
# Usage: ./deploy-linux.sh
################################################################################

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="45.158.126.171"
SERVER_USER="dt-admin"
REMOTE_PATH="/opt/dataspace"
LOCAL_PATH="$(pwd)"
DOCKER_COMPOSE_FILE="infra/docker/docker-compose.production.yml"
ENV_FILE=".env.production"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Dataspace Linux Server Deployment Script                     ║${NC}"
echo -e "${BLUE}║   Server: ${SERVER_IP}                                  ║${NC}"
echo -e "${BLUE}║   User: ${SERVER_USER}                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

################################################################################
# Step 1: Pre-deployment Checks
################################################################################
echo -e "\n${YELLOW}Step 1: Checking local files...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Error: $ENV_FILE not found${NC}"
    echo -e "${YELLOW}Please create $ENV_FILE from .env.example${NC}"
    exit 1
fi

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo -e "${RED}✗ Error: $DOCKER_COMPOSE_FILE not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required files found${NC}"

################################################################################
# Step 2: Validate Configuration
################################################################################
echo -e "\n${YELLOW}Step 2: Validating docker-compose configuration...${NC}"

if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker-compose validation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker-compose configuration is valid${NC}"

################################################################################
# Step 3: Test SSH Connection
################################################################################
echo -e "\n${YELLOW}Step 3: Testing SSH connection to server...${NC}"

if ! ssh -q "${SERVER_USER}@${SERVER_IP}" exit; then
    echo -e "${RED}✗ Cannot connect to ${SERVER_USER}@${SERVER_IP}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ SSH connection successful${NC}"

################################################################################
# Step 4: Prepare Remote Directory
################################################################################
echo -e "\n${YELLOW}Step 4: Preparing remote directory structure...${NC}"

ssh "${SERVER_USER}@${SERVER_IP}" << 'EOFREMOTE'
set -e

# Create required directories
mkdir -p /opt/dataspace
mkdir -p /opt/dataspace/postgres_data
mkdir -p /opt/dataspace/redis_data
mkdir -p /opt/dataspace/logs

# Set proper permissions
chmod 700 /opt/dataspace
chmod 700 /opt/dataspace/postgres_data
chmod 700 /opt/dataspace/redis_data

echo "Remote directories prepared"
EOFREMOTE

echo -e "${GREEN}✓ Remote directories ready${NC}"

################################################################################
# Step 5: Copy Project Files
################################################################################
echo -e "\n${YELLOW}Step 5: Copying project files to server...${NC}"
echo -e "${BLUE}This may take a few minutes depending on file size...${NC}"

# rsync options:
# -a: archive mode (recursive, preserves permissions)
# -v: verbose
# --delete: delete files on remote that don't exist locally
# --exclude: exclude certain files/directories
rsync -av \
    --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    "${LOCAL_PATH}/" \
    "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"

echo -e "${GREEN}✓ Project files copied${NC}"

################################################################################
# Step 6: Copy Environment File
################################################################################
echo -e "\n${YELLOW}Step 6: Copying environment configuration...${NC}"

scp "$ENV_FILE" "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/.env"

# Set proper permissions for .env
ssh "${SERVER_USER}@${SERVER_IP}" chmod 600 "${REMOTE_PATH}/.env"

echo -e "${GREEN}✓ Environment configuration deployed${NC}"

################################################################################
# Step 7: Build Docker Images
################################################################################
echo -e "\n${YELLOW}Step 7: Building Docker images on server...${NC}"
echo -e "${BLUE}This may take 10-30 minutes, please be patient...${NC}"

ssh "${SERVER_USER}@${SERVER_IP}" << EOFBUILD
cd "${REMOTE_PATH}"
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
EOFBUILD

echo -e "${GREEN}✓ Docker images built successfully${NC}"

################################################################################
# Step 8: Deploy Services
################################################################################
echo -e "\n${YELLOW}Step 8: Starting Docker containers...${NC}"

ssh "${SERVER_USER}@${SERVER_IP}" << EOFDEPLOY
cd "${REMOTE_PATH}"
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
EOFDEPLOY

echo -e "${GREEN}✓ Docker containers started${NC}"

################################################################################
# Step 9: Health Check
################################################################################
echo -e "\n${YELLOW}Step 9: Performing health checks...${NC}"
echo -e "${BLUE}Waiting for services to be ready (this may take 1-2 minutes)...${NC}"

ssh "${SERVER_USER}@${SERVER_IP}" << EOFHEALTH
sleep 30

echo "Checking service health..."

# Check IDP service
if curl -sf http://localhost:3000/health > /dev/null; then
    echo "✓ IDP Service (3000) is healthy"
else
    echo "⚠ IDP Service (3000) is not responding yet"
fi

# Check Broker service
if curl -sf http://localhost:3001/health > /dev/null; then
    echo "✓ Broker Service (3001) is healthy"
else
    echo "⚠ Broker Service (3001) is not responding yet"
fi

# Check Hub service
if curl -sf http://localhost:3002/health > /dev/null; then
    echo "✓ Hub Service (3002) is healthy"
else
    echo "⚠ Hub Service (3002) is not responding yet"
fi

# Check PostgreSQL
if docker exec dataspace-postgres-prod pg_isready -U postgres > /dev/null 2>&1; then
    echo "✓ PostgreSQL Database is ready"
else
    echo "⚠ PostgreSQL Database is not ready yet"
fi

# Check Redis
if docker exec dataspace-redis-prod redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis Cache is ready"
else
    echo "⚠ Redis Cache is not ready yet"
fi

# Check Kafka
if docker exec dataspace-kafka-prod kafka-broker-api-versions.sh --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo "✓ Kafka is ready"
else
    echo "⚠ Kafka is not ready yet"
fi

echo ""
echo "Full deployment status:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps
EOFHEALTH

echo -e "${GREEN}✓ Health checks completed${NC}"

################################################################################
# Step 10: Deployment Summary
################################################################################
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    DEPLOYMENT COMPLETED!                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Access Your Services:${NC}"
echo -e "  Frontend:          http://${SERVER_IP}:5174"
echo -e "  IDP Service:       http://${SERVER_IP}:3000"
echo -e "  Broker Service:    http://${SERVER_IP}:3001"
echo -e "  Hub Service:       http://${SERVER_IP}:3002"
echo -e "  Kafka UI:          http://${SERVER_IP}:8080"
echo -e "  Traefik Dashboard: http://${SERVER_IP}:8081"

echo -e "\n${GREEN}Useful Commands:${NC}"
echo -e "  SSH to server:         ssh ${SERVER_USER}@${SERVER_IP}"
echo -e "  View logs:             ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/dataspace && docker-compose -f infra/docker/docker-compose.production.yml logs -f'"
echo -e "  View service status:   ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/dataspace && docker-compose -f infra/docker/docker-compose.production.yml ps'"
echo -e "  Restart service:       ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/dataspace && docker-compose -f infra/docker/docker-compose.production.yml restart [service-name]'"
echo -e "  Stop services:         ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/dataspace && docker-compose -f infra/docker/docker-compose.production.yml down'"

echo -e "\n${YELLOW}Important Notes:${NC}"
echo -e "  1. Update .env.production with your actual passwords before next deployment"
echo -e "  2. Configure SSL/TLS certificates for production"
echo -e "  3. Set up backups for PostgreSQL database"
echo -e "  4. Monitor logs regularly for errors"
echo -e "  5. Keep Docker images updated"

echo -e "\n${BLUE}Deployment completed at $(date)${NC}\n"

