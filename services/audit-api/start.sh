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

# Start with main application
echo "✅ Starting main application..."
exec uvicorn src.main:app --host 0.0.0.0 --port $PORT
