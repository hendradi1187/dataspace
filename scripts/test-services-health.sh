#!/bin/bash

#######################################
# Service Health Check Script
# Monitors health of all dataspace services
# Usage: bash test-services-health.sh [interval]
#######################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Services configuration
declare -A SERVICES=(
    [IDP]="3000:Identity Provider"
    [Broker]="3001:Data Broker"
    [Hub]="3002:Schema Hub"
    [Policy]="3003:Policy Authority"
    [Contract]="3004:Contract Authority"
    [Compliance]="3005:Compliance Service"
    [Ledger]="3006:Ledger Service"
    [Clearing]="3007:Clearing Service"
    [AppStore]="3008:App Store Service"
    [Connector]="3009:Connector Service"
)

# Check interval (default 5 seconds)
CHECK_INTERVAL=${1:-5}

# Counters
HEALTHY=0
UNHEALTHY=0
TOTAL=0

# Function to check service health
check_service() {
    local service=$1
    local port=$2
    local description=$3

    TOTAL=$((TOTAL + 1))

    # Try standard /health endpoint
    response=$(curl -s -m 2 -o /dev/null -w "%{http_code}" http://localhost:$port/health 2>/dev/null)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $service ($port): ${GREEN}HEALTHY${NC} - $description"
        HEALTHY=$((HEALTHY + 1))
        return 0
    else
        # Try service-specific health endpoints
        if [ "$service" = "Connector" ]; then
            response=$(curl -s -m 2 -o /dev/null -w "%{http_code}" http://localhost:$port/connector/health 2>/dev/null)
            if [ "$response" = "200" ]; then
                echo -e "${GREEN}✓${NC} $service ($port): ${GREEN}HEALTHY${NC} (custom endpoint) - $description"
                HEALTHY=$((HEALTHY + 1))
                return 0
            fi
        fi

        echo -e "${RED}✗${NC} $service ($port): ${RED}UNHEALTHY${NC} (HTTP $response) - $description"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

# Function to get service info
get_service_info() {
    local port=$1

    response=$(curl -s -m 2 http://localhost:$port/health 2>/dev/null)

    if [ ! -z "$response" ]; then
        echo "$response"
    fi
}

# Function to check database connection
check_database() {
    echo -e "\n${BLUE}Database Status:${NC}"

    # Try to connect to PostgreSQL
    response=$(timeout 2 pg_isready -h localhost -p 5432 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} PostgreSQL (5432): ${GREEN}CONNECTED${NC}"
    else
        echo -e "${RED}✗${NC} PostgreSQL (5432): ${RED}NOT AVAILABLE${NC}"
    fi
}

# Function to check frontend
check_frontend() {
    echo -e "\n${BLUE}Frontend Status:${NC}"

    response=$(curl -s -m 2 -o /dev/null -w "%{http_code}" http://localhost:5174 2>/dev/null)

    if [ "$response" = "200" ] || [ "$response" = "301" ]; then
        echo -e "${GREEN}✓${NC} Frontend (5174): ${GREEN}RUNNING${NC}"
    else
        echo -e "${RED}✗${NC} Frontend (5174): ${RED}NOT AVAILABLE${NC} (HTTP $response)"
    fi
}

# Main loop
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Dataspace Services Health Monitor                         ║${NC}"
    echo -e "${BLUE}║  Check Interval: ${CHECK_INTERVAL}s                                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

    while true; do
        HEALTHY=0
        UNHEALTHY=0
        TOTAL=0

        echo -e "\n${BLUE}═══ $(date '+%H:%M:%S') Service Status ===${NC}\n"

        # Check all services
        for service in "${!SERVICES[@]}"; do
            IFS=':' read -r port description <<< "${SERVICES[$service]}"
            check_service "$service" "$port" "$description"
        done

        # Check database
        check_database

        # Check frontend
        check_frontend

        # Summary
        echo -e "\n${BLUE}═══ Summary ===${NC}"
        echo -e "Services: ${GREEN}$HEALTHY healthy${NC} | ${RED}$UNHEALTHY unhealthy${NC} | Total: $TOTAL"

        if [ $UNHEALTHY -eq 0 ]; then
            echo -e "${GREEN}✓ All services operational!${NC}"
        else
            echo -e "${RED}✗ Some services are down!${NC}"
        fi

        echo -e "\nNext check in ${CHECK_INTERVAL}s... (Press Ctrl+C to exit)"
        sleep $CHECK_INTERVAL
    done
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Health monitor stopped${NC}"; exit 0' INT

# Run main function
main "$@"
