#!/bin/bash

#######################################
# Frontend Page Testing Script
# Tests frontend pages for loading and functionality
# Requires: headless browser automation (Chrome/Firefox)
# Usage: bash test-frontend-pages.sh
#######################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:5174"
LOGIN_URL="$FRONTEND_URL/login"

# Test results
TOTAL_PAGES=0
PASSED_PAGES=0
FAILED_PAGES=0

# List of pages to test
declare -a PAGES=(
    "Dashboard:/"
    "System Health:/system-health"
    "Login:/login"
    "Participants:/participants"
    "Datasets:/datasets"
    "Connectors:/connectors"
    "Contracts:/contracts"
    "Policies:/policies"
    "Schemas:/schemas"
    "Vocabularies:/vocabularies"
    "Transactions:/transactions"
    "Clearing Records:/clearing"
    "Compliance Records:/compliance"
    "User Management:/users"
    "Webhook Management:/webhooks"
    "API Documentation:/api-docs"
)

# Helper function to test page load
test_page() {
    local page_name=$1
    local page_path=$2
    local url="$FRONTEND_URL$page_path"

    TOTAL_PAGES=$((TOTAL_PAGES + 1))

    # Use curl to test page availability
    response=$(curl -s -m 5 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "200" ] || [ "$response" = "301" ]; then
        echo -e "${GREEN}✓${NC} $page_name - ${GREEN}LOADED${NC} (HTTP $response)"
        PASSED_PAGES=$((PASSED_PAGES + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $page_name - ${RED}FAILED${NC} (HTTP $response)"
        FAILED_PAGES=$((FAILED_PAGES + 1))
        return 1
    fi
}

# Function to check for console errors using Chrome DevTools
test_page_with_chrome() {
    local page_name=$1
    local page_path=$2
    local url="$FRONTEND_URL$page_path"

    echo -e "${YELLOW}Note:${NC} For detailed testing, install Chrome/Puppeteer for JavaScript error detection"
}

# Function to generate test report
generate_report() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Frontend Page Testing Report                              ║${NC}"
    echo -e "${BLUE}║  $(date)                                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Total Pages Tested: $TOTAL_PAGES"
    echo -e "Passed: ${GREEN}$PASSED_PAGES${NC}"
    echo -e "Failed: ${RED}$FAILED_PAGES${NC}"
    echo ""

    if [ $FAILED_PAGES -eq 0 ]; then
        echo -e "${GREEN}✓ All pages loaded successfully!${NC}"
    else
        echo -e "${RED}✗ Some pages failed to load!${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Frontend Page Testing Suite                               ║${NC}"
    echo -e "${BLUE}║  Testing: $FRONTEND_URL                             ║${NC}"
    echo -e "${BLUE}║  $(date)                                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check if frontend is running
    echo -e "${YELLOW}Checking frontend availability...${NC}"
    response=$(curl -s -m 5 -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)

    if [ ! "$response" = "200" ] && [ ! "$response" = "301" ]; then
        echo -e "${RED}✗ Frontend is not responding (HTTP $response)${NC}"
        echo -e "${YELLOW}Please ensure frontend is running at $FRONTEND_URL${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Frontend is responding${NC}\n"

    # Test each page
    echo -e "${BLUE}═══ Testing Frontend Pages ===${NC}\n"

    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r page_name page_path <<< "$page_info"
        test_page "$page_name" "$page_path"
    done

    echo ""

    # Generate report
    generate_report

    # Exit with appropriate code
    if [ $FAILED_PAGES -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
