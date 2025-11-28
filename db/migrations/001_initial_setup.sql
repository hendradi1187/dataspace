-- ============================================================================
-- MIGRATION: 001 - Initial Setup
-- Description: Create initial schema and tables
-- Created: November 2024
-- ============================================================================

BEGIN;

-- Import the core schema
\i '../schema/01-core-tables.sql'

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('version', '1.0.0', 'Database schema version'),
('environment', 'development', 'Deployment environment'),
('created_at', NOW()::text, 'Database creation timestamp')
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
