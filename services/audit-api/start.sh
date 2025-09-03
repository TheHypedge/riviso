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

# Test if the app can import successfully
echo "Testing app import..."
python -c "from src.main import app; print('✅ App imported successfully')" || {
    echo "❌ App import failed, using simple version"
    exec uvicorn src.simple_main:app --host 0.0.0.0 --port $PORT
}

echo "✅ Starting full application..."
# Start the application with uvicorn (lighter for Railway free tier)
# Use full application with audit functionality
exec uvicorn src.main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 30
