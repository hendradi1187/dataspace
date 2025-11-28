-- ============================================================
-- DATASPACE PLATFORM - DATABASE SCHEMA
-- ============================================================
-- This script creates all necessary tables for the dataspace platform
-- including users, roles, credentials, and related entities

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PERMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROLE_PERMISSIONS JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  participant_id UUID,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CREDENTIALS TABLE (OAuth2 Client Credentials)
-- ============================================================
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100) NOT NULL UNIQUE,
  client_secret_hash VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID,
  scope TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- ============================================================
-- API_KEYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID,
  scope TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- ============================================================
-- SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

-- ============================================================
-- AUDIT_LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_credentials_client_id ON credentials(client_id);
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_credentials_status ON credentials(status);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- ============================================================
-- INSERT DEFAULT ROLES
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full system access'),
  ('manager', 'Manager role for team and data management'),
  ('analyst', 'Analyst role for data analysis and reporting'),
  ('viewer', 'Viewer role for read-only access'),
  ('guest', 'Guest role with limited permissions')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================================
INSERT INTO permissions (name, description) VALUES
  ('view:dashboard', 'View dashboard'),
  ('view:participants', 'View participants'),
  ('create:participants', 'Create new participants'),
  ('edit:participants', 'Edit participant data'),
  ('delete:participants', 'Delete participants'),
  ('view:datasets', 'View datasets'),
  ('create:datasets', 'Create new datasets'),
  ('edit:datasets', 'Edit dataset data'),
  ('delete:datasets', 'Delete datasets'),
  ('view:schemas', 'View schemas'),
  ('create:schemas', 'Create new schemas'),
  ('edit:schemas', 'Edit schemas'),
  ('delete:schemas', 'Delete schemas'),
  ('view:policies', 'View policies'),
  ('create:policies', 'Create new policies'),
  ('edit:policies', 'Edit policies'),
  ('delete:policies', 'Delete policies'),
  ('view:contracts', 'View contracts'),
  ('create:contracts', 'Create new contracts'),
  ('edit:contracts', 'Edit contracts'),
  ('delete:contracts', 'Delete contracts'),
  ('view:compliance', 'View compliance records'),
  ('manage:users', 'Manage users'),
  ('manage:roles', 'Manage roles'),
  ('view:audit', 'View audit logs'),
  ('export:data', 'Export data'),
  ('import:data', 'Import data'),
  ('view:health', 'View system health'),
  ('admin:system', 'System administration')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================================

-- Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Manager: Most permissions except admin-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'manager' AND p.name NOT IN ('manage:roles', 'admin:system')
ON CONFLICT DO NOTHING;

-- Analyst: Data analysis permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'analyst' AND p.name IN (
  'view:dashboard', 'view:participants', 'view:datasets', 'view:schemas',
  'view:policies', 'view:contracts', 'view:compliance', 'export:data'
)
ON CONFLICT DO NOTHING;

-- Viewer: Read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer' AND p.name IN (
  'view:dashboard', 'view:participants', 'view:datasets', 'view:schemas',
  'view:policies', 'view:contracts'
)
ON CONFLICT DO NOTHING;

-- Guest: Minimal permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'guest' AND p.name IN ('view:dashboard')
ON CONFLICT DO NOTHING;
