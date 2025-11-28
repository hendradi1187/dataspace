#!/bin/bash

# ============================================================
# DATASPACE PLATFORM - ADMIN SETUP SCRIPT
# ============================================================
# Creates admin user credentials and adds test credentials to IDP service

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔐 DATASPACE PLATFORM - ADMIN & TEST CREDENTIALS SETUP${NC}"
echo "============================================================"
echo ""

# Configuration
IDP_URL="${IDP_URL:-http://localhost:3000}"
ADMIN_CLIENT_ID="admin-client"
ADMIN_CLIENT_SECRET="admin-secret-123"
TEST_CLIENT_ID="test_client"
TEST_CLIENT_SECRET="test_secret"

echo -e "${BLUE}Configuring:${NC}"
echo "  IDP URL: $IDP_URL"
echo "  Admin Client ID: $ADMIN_CLIENT_ID"
echo "  Test Client ID: $TEST_CLIENT_ID"
echo ""

# Step 1: Check IDP service is running
echo -e "${YELLOW}Step 1: Checking IDP Service${NC}"
echo -n "→ Checking IDP health... "

if curl -s "$IDP_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
  echo -e "  ${GREEN}IDP is running at $IDP_URL${NC}"
else
  echo -e "${RED}✗${NC}"
  echo -e "  ${RED}IDP is not accessible at $IDP_URL${NC}"
  echo "  Please ensure IDP service is running on port 3000"
  exit 1
fi

echo ""

# Step 2: Create admin credentials
echo -e "${YELLOW}Step 2: Creating Admin Credentials${NC}"
echo -n "→ Creating admin credential... "

ADMIN_RESPONSE=$(curl -s -X POST "$IDP_URL/credentials" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$ADMIN_CLIENT_ID\",
    \"clientSecret\": \"$ADMIN_CLIENT_SECRET\",
    \"participantId\": \"admin\",
    \"scope\": [\"read:all\", \"write:all\", \"admin:system\"]
  }" 2>/dev/null)

if echo "$ADMIN_RESPONSE" | grep -q "id"; then
  echo -e "${GREEN}✓${NC}"
  ADMIN_ID=$(echo "$ADMIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "  ${GREEN}Admin credential created (ID: $ADMIN_ID)${NC}"
else
  echo -e "${YELLOW}⚠${NC}"
  echo "  Admin credential may already exist or response was: $ADMIN_RESPONSE"
fi

echo ""

# Step 3: Create test credentials
echo -e "${YELLOW}Step 3: Creating Test Credentials${NC}"
echo -n "→ Creating test credential... "

TEST_RESPONSE=$(curl -s -X POST "$IDP_URL/credentials" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$TEST_CLIENT_ID\",
    \"clientSecret\": \"$TEST_CLIENT_SECRET\",
    \"participantId\": \"test-participant\",
    \"scope\": [\"read:data\", \"write:data\", \"read:datasets\"]
  }" 2>/dev/null)

if echo "$TEST_RESPONSE" | grep -q "id"; then
  echo -e "${GREEN}✓${NC}"
  TEST_ID=$(echo "$TEST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "  ${GREEN}Test credential created (ID: $TEST_ID)${NC}"
else
  echo -e "${YELLOW}⚠${NC}"
  echo "  Test credential may already exist or response was: $TEST_RESPONSE"
fi

echo ""

# Step 4: Verify credentials
echo -e "${YELLOW}Step 4: Verifying Credentials${NC}"
echo -n "→ Fetching all credentials... "

CREDS=$(curl -s "$IDP_URL/credentials?pageSize=100")
CRED_COUNT=$(echo "$CREDS" | grep -o '"clientId"' | wc -l)

if [ "$CRED_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ ($CRED_COUNT credentials found)${NC}"
else
  echo -e "${YELLOW}⚠ (No credentials found)${NC}"
fi

echo ""

# Step 5: Test admin token
echo -e "${YELLOW}Step 5: Testing Admin Token${NC}"
echo -n "→ Requesting admin token... "

ADMIN_TOKEN=$(curl -s -X POST "$IDP_URL/token" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$ADMIN_CLIENT_ID\",
    \"clientSecret\": \"$ADMIN_CLIENT_SECRET\",
    \"grantType\": \"client_credentials\"
  }" 2>/dev/null)

if echo "$ADMIN_TOKEN" | grep -q "accessToken"; then
  echo -e "${GREEN}✓${NC}"
  echo -e "  ${GREEN}Admin authentication successful${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "  Token response: $ADMIN_TOKEN"
fi

echo ""

# Step 6: Display credentials
echo "============================================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "============================================================"
echo ""
echo -e "${BLUE}🔑 ADMIN CREDENTIALS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Client ID:     $ADMIN_CLIENT_ID"
echo "  Client Secret: $ADMIN_CLIENT_SECRET"
echo "  Scopes:        read:all, write:all, admin:system"
echo "  Role:          ADMIN - Full system access"
echo ""

echo -e "${BLUE}👥 TEST USER CREDENTIALS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Client ID:     $TEST_CLIENT_ID"
echo "  Client Secret: $TEST_CLIENT_SECRET"
echo "  Scopes:        read:data, write:data, read:datasets"
echo "  Role:          USER - Limited access"
echo ""

echo -e "${BLUE}📝 FRONTEND LOGIN:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Go to: http://localhost:5174"
echo "  (or http://localhost:5173 if port 5174 is not available)"
echo ""
echo "  To login with admin, use:"
echo "    Client ID:     admin-client"
echo "    Client Secret: admin-secret-123"
echo ""

echo -e "${BLUE}📊 API ENDPOINTS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Health:              GET  $IDP_URL/health"
echo "  Get Current User:    GET  $IDP_URL/users/me"
echo "  List Credentials:    GET  $IDP_URL/credentials"
echo "  Request Token:       POST $IDP_URL/token"
echo "  Refresh Token:       POST $IDP_URL/token/refresh"
echo "  Revoke Token:        POST $IDP_URL/token/revoke"
echo ""

echo -e "${BLUE}🧪 TEST WITH CURL:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Get admin token:"
echo "    curl -X POST $IDP_URL/token \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"clientId\":\"admin-client\",\"clientSecret\":\"admin-secret-123\",\"grantType\":\"client_credentials\"}'"
echo ""
echo "  Check current user:"
echo "    curl $IDP_URL/users/me \\"
echo "      -H 'X-Client-ID: admin-client'"
echo ""

echo "============================================================"
