#!/bin/bash

# Docker Configuration Validator
# Validates that all Docker configurations are correct for deployment to 45.158.126.171

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=================================================="
echo "Docker Configuration Validator"
echo "Target Server: 45.158.126.171"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

info() {
    echo "[INFO] $1"
}

# Check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        error "File not found: $1"
        return 1
    fi
    return 0
}

echo "1. Checking required files..."
echo "----------------------------------------"

FILES=(
    "$PROJECT_ROOT/.env.docker-compose"
    "$PROJECT_ROOT/infra/docker/docker-compose.production.yml"
    "$PROJECT_ROOT/apps/frontend/Dockerfile"
)

for file in "${FILES[@]}"; do
    if check_file "$file"; then
        success "Found: $file"
    fi
done
echo ""

echo "2. Validating docker-compose.production.yml..."
echo "----------------------------------------"

COMPOSE_FILE="$PROJECT_ROOT/infra/docker/docker-compose.production.yml"

# Check for incorrect IP bindings
if grep -q "45.158.126.171:[0-9]*:[0-9]*" "$COMPOSE_FILE"; then
    error "Found incorrect port binding '45.158.126.171:PORT:PORT' in docker-compose.production.yml"
    error "Port bindings should use '0.0.0.0:PORT:PORT' or just 'PORT:PORT'"
    echo "  Found at lines:"
    grep -n "45.158.126.171:[0-9]*:[0-9]*" "$COMPOSE_FILE" || true
else
    success "No incorrect IP-specific port bindings found"
fi

# Check for correct bindings
if grep -q "0.0.0.0:[0-9]*:[0-9]*" "$COMPOSE_FILE"; then
    success "Found correct port bindings using 0.0.0.0"
else
    warning "No explicit 0.0.0.0 bindings found (may be using default)"
fi

# Validate docker-compose syntax
info "Validating docker-compose syntax..."
cd "$PROJECT_ROOT"
if docker-compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
    success "docker-compose.production.yml syntax is valid"
else
    error "docker-compose.production.yml has syntax errors"
    docker-compose -f "$COMPOSE_FILE" config 2>&1 || true
fi
echo ""

echo "3. Validating .env.docker-compose..."
echo "----------------------------------------"

ENV_FILE="$PROJECT_ROOT/.env.docker-compose"

# Check for server IP in VITE_API_URL
if grep -q "VITE_API_URL=http://45.158.126.171" "$ENV_FILE"; then
    success "VITE_API_URL correctly uses server IP"
else
    if grep -q "VITE_API_URL=http://localhost" "$ENV_FILE"; then
        error "VITE_API_URL uses localhost instead of server IP 45.158.126.171"
    else
        warning "VITE_API_URL not found or uses unexpected value"
    fi
fi

# Check for individual service URLs
REQUIRED_VITE_VARS=(
    "VITE_IDP_API_URL=http://45.158.126.171:3000"
    "VITE_BROKER_API_URL=http://45.158.126.171:3001"
    "VITE_HUB_API_URL=http://45.158.126.171:3002"
    "VITE_POLICY_API_URL=http://45.158.126.171:3003"
    "VITE_CONTRACT_API_URL=http://45.158.126.171:3004"
    "VITE_COMPLIANCE_API_URL=http://45.158.126.171:3005"
    "VITE_LEDGER_API_URL=http://45.158.126.171:3006"
    "VITE_CLEARING_API_URL=http://45.158.126.171:3007"
    "VITE_APPSTORE_API_URL=http://45.158.126.171:3008"
    "VITE_CONNECTOR_API_URL=http://45.158.126.171:3009"
    "VITE_TRUSTCORE_CLEARING_API_URL=http://45.158.126.171:3010"
    "VITE_TRUSTCORE_CONNECTOR_API_URL=http://45.158.126.171:3011"
)

for var in "${REQUIRED_VITE_VARS[@]}"; do
    if grep -q "$var" "$ENV_FILE"; then
        success "Found: $var"
    else
        error "Missing or incorrect: $var"
    fi
done

# Check internal service URLs use Docker names
INTERNAL_SERVICES=(
    "DB_HOST=postgres"
    "REDIS_HOST=redis"
    "IDP_URL=http://idp:3000"
    "BROKER_URL=http://broker:3001"
)

info "Checking internal service URLs (should use Docker names)..."
for var in "${INTERNAL_SERVICES[@]}"; do
    if grep -q "$var" "$ENV_FILE"; then
        success "Found: $var"
    else
        warning "Not found: $var (may be set in docker-compose)"
    fi
done
echo ""

echo "4. Validating frontend Dockerfile..."
echo "----------------------------------------"

FRONTEND_DOCKERFILE="$PROJECT_ROOT/apps/frontend/Dockerfile"

# Check for all required ARG declarations
REQUIRED_ARGS=(
    "ARG VITE_API_URL"
    "ARG VITE_IDP_API_URL"
    "ARG VITE_BROKER_API_URL"
    "ARG VITE_TRUSTCORE_CLEARING_API_URL"
    "ARG VITE_TRUSTCORE_CONNECTOR_API_URL"
)

for arg in "${REQUIRED_ARGS[@]}"; do
    if grep -q "$arg" "$FRONTEND_DOCKERFILE"; then
        success "Found: $arg"
    else
        error "Missing: $arg in frontend Dockerfile"
    fi
done

# Check for corresponding ENV declarations
for arg in "${REQUIRED_ARGS[@]}"; do
    env_var=$(echo "$arg" | sed 's/ARG/ENV/')
    if grep -q "$env_var" "$FRONTEND_DOCKERFILE"; then
        success "Found: $env_var"
    else
        warning "Missing: $env_var in frontend Dockerfile"
    fi
done
echo ""

echo "5. Checking vite.config.ts..."
echo "----------------------------------------"

VITE_CONFIG="$PROJECT_ROOT/apps/frontend/vite.config.ts"

if check_file "$VITE_CONFIG"; then
    # Check if proxy is disabled or commented
    if grep -q "host: '0.0.0.0'" "$VITE_CONFIG"; then
        success "Vite server configured to listen on 0.0.0.0"
    else
        warning "Vite server host configuration not found"
    fi

    # Check port configuration
    if grep -q "port.*5174" "$VITE_CONFIG"; then
        success "Vite server port set to 5174"
    else
        warning "Vite server port may not be set to 5174"
    fi
fi
echo ""

echo "6. Checking docker-compose.production.yml frontend configuration..."
echo "----------------------------------------"

# Check if frontend build args are set
if grep -A 20 "frontend:" "$COMPOSE_FILE" | grep -q "VITE_IDP_API_URL"; then
    success "Frontend build args include VITE_IDP_API_URL"
else
    error "Frontend build args missing VITE_IDP_API_URL"
fi

if grep -A 20 "frontend:" "$COMPOSE_FILE" | grep -q "VITE_TRUSTCORE_CLEARING_API_URL"; then
    success "Frontend build args include VITE_TRUSTCORE_CLEARING_API_URL"
else
    error "Frontend build args missing VITE_TRUSTCORE_CLEARING_API_URL"
fi
echo ""

echo "7. Summary..."
echo "----------------------------------------"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Configuration is ready for deployment to 45.158.126.171"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ All critical checks passed, but there are $WARNINGS warnings${NC}"
    echo "Review warnings above before deployment"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS errors and $WARNINGS warnings${NC}"
    echo "Please fix the errors above before deployment"
    exit 1
fi
