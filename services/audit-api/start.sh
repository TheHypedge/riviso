#!/bin/bash

# Set default environment variables if not set
export PORT=${PORT:-8000}
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./seo_audit.db"}
export ENVIRONMENT=${ENVIRONMENT:-"production"}
export DEBUG=${DEBUG:-"false"}

echo "Starting RIVISO Analytics API..."
echo "Port: $PORT"
echo "Environment: $ENVIRONMENT"
echo "Database URL: $DATABASE_URL"

# Start the application
exec gunicorn src.main:app --config gunicorn.conf.py
