#!/bin/bash

# Production Docker Compose Start Script
# Usage: ./start-docker-production.sh [start|stop|restart|logs|ps|down|pull]

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$PROJECT_ROOT/infra/docker"
ENV_FILE="$PROJECT_ROOT/.env.docker-compose"

echo "=================================================="
echo "Dataspace Production Docker Compose Manager"
echo "=================================================="
echo "Project Root: $PROJECT_ROOT"
echo "Docker Dir: $DOCKER_DIR"
echo "Environment File: $ENV_FILE"
echo ""

# Check if .env.docker-compose exists
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: Environment file not found: $ENV_FILE"
    exit 1
fi

# Check if docker-compose.production.yml exists
if [ ! -f "$DOCKER_DIR/docker-compose.production.yml" ]; then
    echo "ERROR: docker-compose.production.yml not found at: $DOCKER_DIR/docker-compose.production.yml"
    exit 1
fi

# Get command from argument or default to 'start'
COMMAND="${1:-start}"

# Change to docker directory
cd "$DOCKER_DIR"

case "$COMMAND" in
    start)
        echo "📦 Starting all services with Docker Compose..."
        echo "⏳ This may take 5-10 minutes on first run..."
        echo ""
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            up --build -d
        echo ""
        echo "✅ Services started in background"
        echo "📊 Check status: $0 ps"
        echo "📋 View logs: $0 logs [service_name]"
        ;;

    stop)
        echo "🛑 Stopping all services..."
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            stop
        echo "✅ All services stopped"
        ;;

    restart)
        echo "🔄 Restarting all services..."
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            restart
        echo "✅ Services restarted"
        ;;

    down)
        echo "💥 Stopping and removing all containers..."
        echo "⚠️  WARNING: Data in volumes will be preserved"
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            down
        echo "✅ All containers removed"
        ;;

    logs)
        SERVICE="${2:-}"
        if [ -n "$SERVICE" ]; then
            echo "📋 Logs for service: $SERVICE"
            docker-compose -f docker-compose.production.yml \
                --env-file "$ENV_FILE" \
                logs -f --tail=100 "$SERVICE"
        else
            echo "📋 All logs (press Ctrl+C to stop)..."
            docker-compose -f docker-compose.production.yml \
                --env-file "$ENV_FILE" \
                logs -f --tail=50
        fi
        ;;

    ps)
        echo "📊 Container Status:"
        echo ""
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            ps
        ;;

    pull)
        echo "🔄 Pulling latest images..."
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            pull
        echo "✅ Images updated"
        ;;

    health)
        echo "🏥 Health Check Status:"
        echo ""
        docker-compose -f docker-compose.production.yml \
            --env-file "$ENV_FILE" \
            ps --format "table {{.Names}}\t{{.Status}}"
        ;;

    clean)
        echo "🧹 Cleaning up Docker resources..."
        docker system prune -f --volumes
        echo "✅ Cleanup complete"
        ;;

    *)
        echo "Usage: $0 [start|stop|restart|down|logs|ps|pull|health|clean]"
        echo ""
        echo "Commands:"
        echo "  start       - Start all services in background"
        echo "  stop        - Stop all services (keep containers)"
        echo "  restart     - Restart all services"
        echo "  down        - Stop and remove all containers"
        echo "  logs [svc]  - View logs (optional: specify service name)"
        echo "  ps          - Show container status"
        echo "  pull        - Pull latest images"
        echo "  health      - Check health status"
        echo "  clean       - Clean unused Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 start                    # Start all services"
        echo "  $0 logs idp                 # View IDP service logs"
        echo "  $0 logs postgres            # View database logs"
        echo "  $0 ps                       # Show all containers"
        exit 1
        ;;
esac
