#!/bin/bash

# SEO Audit Platform Setup Script
set -e

echo "🚀 Setting up SEO Audit Platform..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
pnpm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd services/audit-api
pip install -e .

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please edit it with your configuration."
fi

cd ../..

# Start infrastructure
echo "🐳 Starting infrastructure..."
docker-compose -f infra/docker-compose.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
cd services/audit-api
alembic upgrade head
cd ../..

echo "✅ Setup complete!"
echo ""
echo "🎉 Your SEO Audit Platform is ready!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Database Admin: http://localhost:8080"
echo ""
echo "To start development:"
echo "  make dev"
echo ""
echo "To stop infrastructure:"
echo "  make docker-down"
