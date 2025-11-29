-- PostgreSQL Database Initialization Script
-- This script initializes the database for the dataspace platform

-- Connect to default postgres database first
\connect postgres;

-- Drop database if it exists (fresh start)
DROP DATABASE IF EXISTS dataspace_dev;
DROP DATABASE IF EXISTS dataspace_prod;

-- Create database
CREATE DATABASE dataspace_dev;
CREATE DATABASE dataspace_prod;

-- Connect to the development database
\connect dataspace_dev;

-- Set default schema
SET search_path TO public;

-- Create extensions (only those available in alpine postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Note: postgis, hstore, and jsonb_plperl not available in alpine image
-- They require additional system packages not included in the base image

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dataspace_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Commit transaction
COMMIT;

