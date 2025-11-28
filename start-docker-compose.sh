#!/bin/bash

# Full Stack Docker Compose Startup Script
# Starts all services including Frontend on Port 5174

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/infra/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                 $1                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"

    if [ ! -f "$DOCKER_DIR/docker-compose.yml" ]; then
        print_error "docker-compose.yml not found at $DOCKER_DIR"
        exit 1
    fi
    print_success "docker-compose.yml found"

    if [ ! -f "$SCRIPT_DIR/.env.docker-compose" ]; then
        print_info "Creating .env.docker-compose from template..."
        if [ -f "$SCRIPT_DIR/.env.production" ]; then
            cp "$SCRIPT_DIR/.env.production" "$SCRIPT_DIR/.env.docker-compose"
            print_success ".env.docker-compose created"
        fi
    fi
}

# Check port availability
check_ports() {
    print_section "Checking Port Availability"

    REQUIRED_PORTS=(5174 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 5432 6379 2181 9092 8080)
    BLOCKED_PORTS=()

    for port in "${REQUIRED_PORTS[@]}"; do
        if netstat -ano 2>/dev/null | grep -q ":$port "; then
            BLOCKED_PORTS+=($port)
        fi
    done

    if [ ${#BLOCKED_PORTS[@]} -gt 0 ]; then
        print_error "Some ports are already in use: ${BLOCKED_PORTS[*]}"
        echo -e "${YELLOW}You may need to stop existing containers or processes${NC}"
        echo ""
        echo -e "${YELLOW}Current Docker containers:${NC}"
        docker ps
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "All required ports are available"
    fi
}

# Stop existing containers
stop_existing() {
    print_section "Stopping Existing Containers"

    cd "$DOCKER_DIR"

    if docker-compose -f docker-compose.yml ps 2>/dev/null | grep -q "Up"; then
        print_info "Found running containers, stopping..."
        docker-compose down 2>/dev/null || true
        sleep 2
        print_success "Containers stopped"
    else
        print_info "No running containers found"
    fi
}

# Build images
build_images() {
    print_section "Building Docker Images"

    cd "$DOCKER_DIR"

    echo -e "${YELLOW}This may take 5-10 minutes on first build...${NC}"
    echo ""

    docker-compose \
        -f docker-compose.yml \
        --env-file "../../.env.docker-compose" \
        build --no-cache

    print_success "All images built successfully"
}

# Start services
start_services() {
    print_section "Starting All Services"

    cd "$DOCKER_DIR"

    echo -e "${YELLOW}Starting services in background...${NC}"
    echo ""

    docker-compose \
        -f docker-compose.yml \
        --env-file "../../.env.docker-compose" \
        up -d

    print_success "Services started"
}

# Wait for services
wait_services() {
    print_section "Waiting for Services to be Ready"

    cd "$DOCKER_DIR"

    SERVICES=("postgres" "redis" "idp" "broker" "hub" "frontend")
    TIMEOUT=60
    ELAPSED=0

    for service in "${SERVICES[@]}"; do
        echo -ne "${YELLOW}Waiting for $service...${NC}"
        while [ $ELAPSED -lt $TIMEOUT ]; do
            if docker-compose -f docker-compose.yml ps "$service" 2>/dev/null | grep -q "healthy\|running"; then
                echo -e " ${GREEN}Ready${NC}"
                break
            fi
            echo -n "."
            sleep 2
            ELAPSED=$((ELAPSED + 2))
        done

        if [ $ELAPSED -ge $TIMEOUT ]; then
            echo -e " ${RED}Timeout${NC}"
        fi
    done
}

# Show service status
show_status() {
    print_section "Service Status"

    cd "$DOCKER_DIR"

    docker-compose \
        -f docker-compose.yml \
        ps
}

# Show access information
show_info() {
    print_section "Access Information"

    echo ""
    echo -e "${GREEN}Frontend:${NC}"
    echo -e "  URL: http://localhost:5174"
    echo ""

    echo -e "${GREEN}Microservices:${NC}"
    echo -e "  IDP:        http://localhost:3000"
    echo -e "  Broker:     http://localhost:3001"
    echo -e "  Hub:        http://localhost:3002"
    echo -e "  Policy:     http://localhost:3003"
    echo -e "  Contract:   http://localhost:3004"
    echo -e "  Compliance: http://localhost:3005"
    echo -e "  Ledger:     http://localhost:3006"
    echo -e "  Clearing:   http://localhost:3007"
    echo -e "  AppStore:   http://localhost:3008"
    echo -e "  Connector:  http://localhost:3009"
    echo ""

    echo -e "${GREEN}Infrastructure:${NC}"
    echo -e "  PostgreSQL: localhost:5432"
    echo -e "  Redis:      localhost:6379"
    echo -e "  Kafka:      localhost:9092"
    echo -e "  Zookeeper:  localhost:2181"
    echo -e "  Adminer:    http://localhost:8080"
    echo -e "  Kafka UI:   http://localhost:8080/kafka-ui"
    echo ""

    echo -e "${GREEN}Credentials:${NC}"
    echo -e "  DB User:     postgres"
    echo -e "  DB Password: postgres"
    echo -e "  Adminer:     Visit http://localhost:8080"
    echo ""
}

# Show logs
show_logs() {
    print_section "Live Logs"

    cd "$DOCKER_DIR"

    echo -e "${YELLOW}Showing last 50 lines of each service${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop viewing logs${NC}"
    echo ""

    docker-compose \
        -f docker-compose.yml \
        logs -f --tail=50
}

# Test connectivity
test_connectivity() {
    print_section "Testing Service Connectivity"

    echo ""
    SERVICES=(
        "http://localhost:5174:Frontend"
        "http://localhost:3000/health:IDP"
        "http://localhost:3001/health:Broker"
        "http://localhost:3002/health:Hub"
    )

    for service in "${SERVICES[@]}"; do
        IFS=':' read -r url name <<< "$service"
        echo -ne "${YELLOW}Testing $name...${NC}"

        if timeout 5 curl -s "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓ OK${NC}"
        else
            echo -e " ${RED}✗ Failed${NC}"
        fi
    done

    echo ""
}

# Main flow
main() {
    print_header "Full Stack Docker Compose Startup"

    COMMAND=${1:-start}

    case $COMMAND in
        start)
            check_prerequisites
            check_ports
            stop_existing
            build_images
            start_services
            wait_services
            show_status
            show_info
            test_connectivity
            print_success "Full stack started successfully!"
            print_info "View logs: docker-compose -f infra/docker/docker-compose.yml logs -f"
            ;;

        logs)
            print_section "Docker Compose Logs"
            cd "$DOCKER_DIR"
            docker-compose -f docker-compose.yml logs -f --tail=50
            ;;

        stop)
            print_section "Stopping Services"
            cd "$DOCKER_DIR"
            docker-compose -f docker-compose.yml down
            print_success "Services stopped"
            ;;

        restart)
            print_section "Restarting Services"
            cd "$DOCKER_DIR"
            docker-compose -f docker-compose.yml restart
            print_success "Services restarted"
            ;;

        ps|status)
            show_status
            ;;

        clean)
            print_section "Cleaning Up Docker Resources"
            cd "$DOCKER_DIR"
            docker-compose -f docker-compose.yml down -v
            echo -e "${YELLOW}Removing unused images...${NC}"
            docker image prune -f
            print_success "Cleanup complete"
            ;;

        test)
            test_connectivity
            ;;

        info)
            show_info
            ;;

        *)
            echo -e "${YELLOW}Usage: $0 [COMMAND]${NC}"
            echo ""
            echo -e "${GREEN}Commands:${NC}"
            echo "  start       - Start full stack (builds & runs)"
            echo "  logs        - View live logs"
            echo "  ps|status   - Show service status"
            echo "  stop        - Stop all services"
            echo "  restart     - Restart services"
            echo "  test        - Test service connectivity"
            echo "  info        - Show access information"
            echo "  clean       - Clean up Docker resources"
            echo ""
            echo -e "${YELLOW}Examples:${NC}"
            echo "  $0 start           # Start everything"
            echo "  $0 logs            # View logs"
            echo "  $0 ps              # Check status"
            echo "  $0 stop            # Stop services"
            ;;
    esac
}

main "$@"
