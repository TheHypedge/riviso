-- Initialize SEO Audit database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (handled by POSTGRES_DB)
-- The database is created automatically by the postgres image

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Alembic migrations)
-- These are just examples of what might be useful

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE seo_audit TO seo_audit;
