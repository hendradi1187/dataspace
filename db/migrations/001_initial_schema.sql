-- Migration: 001_initial_schema
-- Version: 1.0.0
-- Date: 2024
-- Description: Create initial Dataspace schema

BEGIN;

-- Include initial schema
\i '../ddl/00-initial-schema.sql'

-- Seed data
INSERT INTO system_config (key, value, description) VALUES
  ('version', '1.0.0', 'Current schema version'),
  ('environment', 'development', 'Environment type')
ON CONFLICT (key) DO NOTHING;

COMMIT;
