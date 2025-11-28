#!/bin/bash

#######################################
# API Endpoint Testing Script
# Tests all CRUD operations for dataspace services
# Usage: bash test-api-endpoints.sh
#######################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost"
POLICY_PORT=3003
CONTRACT_PORT=3004
COMPLIANCE_PORT=3005
LEDGER_PORT=3006
CLEARING_PORT=3007
CONNECTOR_PORT=3009

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local port=$3
    local data=$4
    local description=$5

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL:$port$endpoint" \
            -H "Content-Type: application/json" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL:$port$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [[ "$http_code" =~ ^(200|201)$ ]]; then
        echo -e "${GREEN}✓${NC} [$method] $endpoint (HTTP $http_code) - $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "$body"
    else
        echo -e "${RED}✗${NC} [$method] $endpoint (HTTP $http_code) - $description"
        echo "  Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi

    echo ""
}

# Function to check service health
check_health() {
    local port=$1
    local service=$2

    echo -e "${BLUE}═══ Checking $service Health ===${NC}"
    make_request "GET" "/health" "$port" "" "Health check"
}

# Function to test CRUD operations
test_crud_operations() {
    local port=$1
    local service=$2
    local endpoint=$3
    local name=$4

    echo -e "${BLUE}═══ Testing $service CRUD Operations ===${NC}"

    # CREATE
    create_payload="{
        \"name\": \"Test $name $(date +%s)\",
        \"description\": \"Automated test $name\",
        \"rules\": {\"test\": \"true\", \"automated\": \"yes\"},
        \"status\": \"draft\"
    }"

    echo -e "${YELLOW}CREATE:${NC}"
    create_response=$(curl -s -w "\n%{http_code}" -X "POST" "$BASE_URL:$port$endpoint" \
        -H "Content-Type: application/json" \
        -d "$create_payload" 2>/dev/null)

    create_http=$(echo "$create_response" | tail -n1)
    create_body=$(echo "$create_response" | head -n-1)

    if [[ "$create_http" =~ ^(200|201)$ ]]; then
        echo -e "${GREEN}✓${NC} Created $name (HTTP $create_http)"
        PASSED_TESTS=$((PASSED_TESTS + 1))

        # Extract ID from response
        id=$(echo "$create_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

        if [ ! -z "$id" ]; then
            echo "  ID: $id"

            # READ (GET single)
            echo -e "${YELLOW}READ:${NC}"
            make_request "GET" "$endpoint/$id" "$port" "" "Get $name by ID"

            # UPDATE
            echo -e "${YELLOW}UPDATE:${NC}"
            update_payload="{
                \"name\": \"Updated $name $(date +%s)\",
                \"status\": \"active\"
            }"
            make_request "PUT" "$endpoint/$id" "$port" "$update_payload" "Update $name"

            # DELETE
            echo -e "${YELLOW}DELETE:${NC}"
            make_request "DELETE" "$endpoint/$id" "$port" "" "Delete $name"
        fi
    else
        echo -e "${RED}✗${NC} Failed to create $name (HTTP $create_http)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "  Response: $create_body"
    fi

    # LIST
    echo -e "${YELLOW}LIST:${NC}"
    make_request "GET" "$endpoint?page=1&pageSize=10" "$port" "" "List all $name"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Dataspace API Endpoint Testing Suite                      ║${NC}"
    echo -e "${BLUE}║  $(date)                                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Test Health Checks
    echo -e "${BLUE}█████ HEALTH CHECKS █████${NC}"
    echo ""
    check_health "$POLICY_PORT" "TrustCore Policy Service"
    check_health "$CONTRACT_PORT" "TrustCore Contract Service"
    check_health "$COMPLIANCE_PORT" "TrustCore Compliance Service"
    check_health "$LEDGER_PORT" "TrustCore Ledger Service"
    check_health "$CLEARING_PORT" "TrustCore Clearing Service"
    check_health "$CONNECTOR_PORT" "TrustCore Connector Service"

    echo ""
    echo -e "${BLUE}█████ CRUD OPERATIONS █████${NC}"
    echo ""

    # Test Policies
    test_crud_operations "$POLICY_PORT" "TrustCore Policy" "/policies" "Policy"

    # Test Contracts
    test_crud_operations "$CONTRACT_PORT" "TrustCore Contract" "/contracts" "Contract"

    # Test Compliance
    test_crud_operations "$COMPLIANCE_PORT" "TrustCore Compliance" "/compliance-records" "Compliance"

    # Test Ledger/Transactions
    test_crud_operations "$LEDGER_PORT" "TrustCore Ledger" "/transactions" "Transaction"

    # Test Clearing
    test_crud_operations "$CLEARING_PORT" "TrustCore Clearing" "/clearing-records" "ClearingRecord"

    # Test Connector
    test_crud_operations "$CONNECTOR_PORT" "TrustCore Connector" "/connectors" "Connector"

    # Summary
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Test Summary                                              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo -e "Total Tests:  $TOTAL_TESTS"
    echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}✓ All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}✗ Some tests failed!${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
