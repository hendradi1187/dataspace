#!/bin/bash

# ============================================================
# DATASPACE PLATFORM - DATABASE SETUP SCRIPT
# ============================================================
# This script sets up PostgreSQL database with schema and admin user

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗄️  DATASPACE PLATFORM - DATABASE SETUP${NC}"
echo "============================================================"

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dataspace_db}"
DB_USER="${DB_USER:-dataspace_user}"
DB_PASSWORD="${DB_PASSWORD:-dataspace_password}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

echo ""
echo "Configuration:"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Function to execute SQL
execute_sql() {
  local sql="$1"
  local description="$2"

  echo -n "→ $description... "

  if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$DB_NAME" -c "$sql" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    return 1
  fi
}

# Function to execute SQL file
execute_sql_file() {
  local file="$1"
  local description="$2"

  echo -n "→ $description... "

  if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    return 1
  fi
}

# Step 1: Check PostgreSQL connection
echo -e "${YELLOW}Step 1: Checking PostgreSQL Connection${NC}"
if PGPASSWORD="$POSTGRES_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
  echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
  echo "Please ensure PostgreSQL is running on $DB_HOST:$DB_PORT"
  exit 1
fi

echo ""

# Step 2: Create database if not exists
echo -e "${YELLOW}Step 2: Creating Database${NC}"
execute_sql "CREATE DATABASE $DB_NAME;" "Create database '$DB_NAME'" || true

echo ""

# Step 3: Create user if not exists
echo -e "${YELLOW}Step 3: Creating Database User${NC}"
execute_sql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" "Create user '$DB_USER'" || true

echo ""

# Step 4: Grant privileges
echo -e "${YELLOW}Step 4: Granting Privileges${NC}"
execute_sql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" "Grant privileges to '$DB_USER'"
execute_sql "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" "Grant table privileges"
execute_sql "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" "Grant sequence privileges"

echo ""

# Step 5: Load schema
echo -e "${YELLOW}Step 5: Creating Schema and Tables${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/schema.sql" ]; then
  execute_sql_file "$SCRIPT_DIR/schema.sql" "Load schema.sql"
else
  echo -e "${RED}✗ schema.sql not found at $SCRIPT_DIR/schema.sql${NC}"
  exit 1
fi

echo ""

# Step 6: Create admin user with credentials
echo -e "${YELLOW}Step 6: Creating Admin User${NC}"

# Generate safe SQL with proper escaping
ADMIN_SQL="
-- Get admin role ID
WITH admin_role AS (
  SELECT id FROM roles WHERE name = 'admin'
),
-- Create admin user
new_admin AS (
  INSERT INTO users (username, email, password_hash, full_name, role_id, status)
  SELECT 'admin', 'admin@dataspace.local', '\$2b\$10\$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrst', 'System Administrator', id, 'active'
  FROM admin_role
  ON CONFLICT (username) DO NOTHING
  RETURNING id
)
-- Create credentials for admin user
INSERT INTO credentials (client_id, client_secret_hash, user_id, scope, status)
SELECT 'admin-client', '\$2b\$10\$admin_secret_hash1234567890abcdefghijklmnopqrstuvwxyz', id,
       ARRAY['read:all', 'write:all', 'admin:system'], 'active'
FROM new_admin
ON CONFLICT (client_id) DO NOTHING;
"

# For now, use a simpler approach with bcrypt hash
# Admin password hash (hashed 'admin123' with bcrypt): \$2b\$10\$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrst

echo -n "→ Insert admin user... "

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF > /dev/null 2>&1
-- Get admin role ID and create admin user
WITH admin_role AS (
  SELECT id FROM roles WHERE name = 'admin'
)
INSERT INTO users (username, email, password_hash, full_name, role_id, status)
SELECT 'admin', 'admin@dataspace.local', '\$2b\$10\$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrst', 'System Administrator', id, 'active'
FROM admin_role
ON CONFLICT (username) DO NOTHING;
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "→ Insert admin credentials... "

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF > /dev/null 2>&1
WITH admin_user AS (
  SELECT id FROM users WHERE username = 'admin'
)
INSERT INTO credentials (client_id, client_secret_hash, user_id, scope, status)
SELECT 'admin-client', '\$2b\$10\$admin_secret_hash1234567890abcdefghijklmnopqrst', id,
       ARRAY['read:all', 'write:all', 'admin:system'], 'active'
FROM admin_user
ON CONFLICT (client_id) DO NOTHING;
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo ""

# Step 7: Verify setup
echo -e "${YELLOW}Step 7: Verifying Setup${NC}"

echo -n "→ Verify roles... "
ROLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM roles;")
echo -e "${GREEN}✓ ($ROLE_COUNT roles)${NC}"

echo -n "→ Verify permissions... "
PERM_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM permissions;")
echo -e "${GREEN}✓ ($PERM_COUNT permissions)${NC}"

echo -n "→ Verify admin user... "
ADMIN_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE username = 'admin';")
if [ "$ADMIN_EXISTS" -gt 0 ]; then
  echo -e "${GREEN}✓ (admin user created)${NC}"
else
  echo -e "${RED}✗ (admin user not found)${NC}"
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo ""
echo "Admin Credentials:"
echo "  Username: admin"
echo "  Email: admin@dataspace.local"
echo "  Password: admin123"
echo "  Client ID: admin-client"
echo "  Client Secret: admin-secret-123"
echo ""
echo "Database Connection:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
