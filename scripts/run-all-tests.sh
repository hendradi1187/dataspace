#!/bin/bash

#######################################
# Complete Test Suite Runner
# Runs all automated tests in sequence
# Usage: bash run-all-tests.sh
#######################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Results file
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).txt"

# Function to run test suite
run_test_suite() {
    local test_name=$1
    local test_script=$2

    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: $test_name${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    if [ -f "$test_script" ]; then
        if bash "$test_script"; then
            echo -e "\n${GREEN}✓ $test_name PASSED${NC}"
            return 0
        else
            echo -e "\n${RED}✗ $test_name FAILED${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Test script not found: $test_script${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Dataspace Complete Test Suite                             ║${NC}"
    echo -e "${BLUE}║  $(date)                                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

    # Verify test scripts exist
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    echo -e "\n${YELLOW}Verifying test scripts...${NC}"

    if [ ! -d "$SCRIPT_DIR" ]; then
        echo -e "${RED}Error: Script directory not found${NC}"
        exit 1
    fi

    # Run tests
    PASSED_SUITES=0
    FAILED_SUITES=0

    # Test 1: Health Checks (non-blocking)
    if run_test_suite "Service Health Checks" "$SCRIPT_DIR/test-services-health.sh"; then
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi

    # Test 2: API Endpoints
    if run_test_suite "API Endpoint Tests" "$SCRIPT_DIR/test-api-endpoints.sh"; then
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi

    # Test 3: Frontend Pages
    if run_test_suite "Frontend Page Tests" "$SCRIPT_DIR/test-frontend-pages.sh"; then
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi

    # Summary
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Test Suite Summary                                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

    echo -e "Total Test Suites: $((PASSED_SUITES + FAILED_SUITES))"
    echo -e "Passed: ${GREEN}$PASSED_SUITES${NC}"
    echo -e "Failed: ${RED}$FAILED_SUITES${NC}"
    echo -e "\nResults saved to: $RESULTS_FILE"

    if [ $FAILED_SUITES -eq 0 ]; then
        echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ ALL TEST SUITES PASSED!                                 ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        echo -e "\n${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ✗ SOME TEST SUITES FAILED!                                ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        exit 1
    fi
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Test suite interrupted${NC}"; exit 1' INT

# Run main function
main "$@"
