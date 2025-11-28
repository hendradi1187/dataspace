#!/bin/bash

# Frontend Port 5174 Setup Script
# This script helps setup and run frontend on port 5174 (production mode)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/apps/frontend"
DOCKER_DIR="$SCRIPT_DIR/infra/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      Frontend Port 5174 (Production) Setup Script      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Parse command line arguments
OPTION=${1:-interactive}

case $OPTION in
  build-docker)
    echo -e "${YELLOW}🐳 Building Docker image...${NC}"
    docker build -f "$SCRIPT_DIR/apps/frontend/Dockerfile" \
      -t dataspace-frontend:latest "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
    ;;

  run-docker)
    echo -e "${YELLOW}🚀 Running frontend container on port 5174...${NC}"
    docker rm -f dataspace-frontend-prod 2>/dev/null || true
    docker run -d \
      --name dataspace-frontend-prod \
      -p 5174:5174 \
      dataspace-frontend:latest
    sleep 3
    if curl -s http://localhost:5174 > /dev/null; then
      echo -e "${GREEN}✓ Frontend is running on http://localhost:5174${NC}"
    else
      echo -e "${RED}✗ Frontend failed to start${NC}"
      docker logs dataspace-frontend-prod
    fi
    ;;

  run-local)
    echo -e "${YELLOW}📦 Building production version locally...${NC}"
    cd "$FRONTEND_DIR"
    pnpm run build
    echo -e "${GREEN}✓ Build complete${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Starting preview server on port 5174...${NC}"
    pnpm run preview -- --host 0.0.0.0 --port 5174
    ;;

  compose)
    echo -e "${YELLOW}🐳 Running full stack with Docker Compose...${NC}"
    cd "$DOCKER_DIR"
    docker-compose \
      -f docker-compose.yml \
      -f docker-compose.dev.5174.yml \
      --env-file "../../.env.production" \
      up --build
    ;;

  compose-detach)
    echo -e "${YELLOW}🐳 Running full stack in background...${NC}"
    cd "$DOCKER_DIR"
    docker-compose \
      -f docker-compose.yml \
      -f docker-compose.dev.5174.yml \
      --env-file "../../.env.production" \
      up --build -d
    echo -e "${GREEN}✓ Stack started in background${NC}"
    echo -e "${YELLOW}Check status: docker-compose ps${NC}"
    ;;

  logs)
    echo -e "${YELLOW}📋 Frontend container logs...${NC}"
    docker logs -f dataspace-frontend-prod
    ;;

  stop)
    echo -e "${YELLOW}⏹️  Stopping frontend container...${NC}"
    docker rm -f dataspace-frontend-prod
    echo -e "${GREEN}✓ Container stopped${NC}"
    ;;

  clean)
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    docker rm -f dataspace-frontend-prod test-frontend 2>/dev/null || true
    docker image rm -f dataspace-frontend:latest 2>/dev/null || true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    ;;

  *)
    echo -e "${YELLOW}Available commands:${NC}"
    echo ""
    echo -e "${GREEN}Local Development:${NC}"
    echo "  $0 run-local       - Build and run frontend locally (port 5174)"
    echo ""
    echo -e "${GREEN}Docker:${NC}"
    echo "  $0 build-docker    - Build Docker image for frontend"
    echo "  $0 run-docker      - Run frontend container (port 5174)"
    echo "  $0 logs            - Show container logs"
    echo "  $0 stop            - Stop frontend container"
    echo ""
    echo -e "${GREEN}Docker Compose (Full Stack):${NC}"
    echo "  $0 compose         - Run full stack in foreground"
    echo "  $0 compose-detach  - Run full stack in background"
    echo ""
    echo -e "${GREEN}Maintenance:${NC}"
    echo "  $0 clean           - Clean Docker resources"
    echo ""
    echo -e "${YELLOW}Quick Start:${NC}"
    echo "  # Local development"
    echo "  $0 run-local"
    echo ""
    echo "  # Or with Docker"
    echo "  $0 build-docker"
    echo "  $0 run-docker"
    echo ""
    echo "  # Or full stack"
    echo "  $0 compose-detach"
    echo ""
    ;;
esac
