-- PostgreSQL Database Initialization Script
-- This script initializes the database for the dataspace platform

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE dataspace_dev' WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'dataspace_dev'
)\gexec

-- Connect to the database
\connect dataspace_dev;

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set default schema
SET search_path TO public;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "jsonb_plperl" CASCADE;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dataspace_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Commit transaction
COMMIT;

