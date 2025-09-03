#!/bin/bash

# RIVISO Production Deployment Script for Hostinger
# This script will help you deploy your SEO audit platform to riviso.com

set -e

echo "🚀 RIVISO Production Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting production build process..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
pnpm install

# Step 2: Build shared package
print_status "Building shared package..."
cd packages/shared
pnpm build
cd ../..

# Step 3: Build frontend
print_status "Building frontend for production..."
cd apps/web
pnpm build
cd ../..

# Step 4: Create deployment package
print_status "Creating deployment package..."
mkdir -p deployment

# Copy frontend build
cp -r apps/web/.next deployment/frontend
cp -r apps/web/public deployment/frontend/public
cp apps/web/package.json deployment/frontend/
cp apps/web/next.config.mjs deployment/frontend/

# Copy backend
cp -r services/audit-api deployment/backend
cp -r packages/shared deployment/shared

# Copy configuration files
cp production-config.env deployment/
cp deploy.sh deployment/

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# RIVISO Deployment Instructions for Hostinger

## Prerequisites
1. Hostinger hosting account with:
   - PHP 8.1+ support
   - MySQL database
   - SSH access (if available)
   - Node.js support (if available)

## Deployment Steps

### Option 1: Using Hostinger File Manager (Recommended for beginners)

1. **Upload Files:**
   - Upload the entire `deployment` folder to your public_html directory
   - Extract the files if they're compressed

2. **Set up Database:**
   - Create a MySQL database in Hostinger control panel
   - Note down database credentials
   - Update `production-config.env` with your database details

3. **Configure Domain:**
   - Point riviso.com to your hosting account
   - Set up SSL certificate (Let's Encrypt is free)

### Option 2: Using SSH (Advanced users)

1. **Connect via SSH:**
   ```bash
   ssh username@your-server-ip
   ```

2. **Upload files:**
   ```bash
   scp -r deployment/* username@your-server-ip:/home/username/public_html/
   ```

3. **Set up environment:**
   ```bash
   cd /home/username/public_html
   cp production-config.env .env
   # Edit .env with your database credentials
   ```

4. **Install Python dependencies:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the application:**
   ```bash
   # Start backend
   uvicorn src.main:app --host 0.0.0.0 --port 8000 &
   
   # Start frontend (if Node.js is available)
   cd ../frontend
   npm start &
   ```

## Configuration

1. **Update Database Settings:**
   - Edit `production-config.env`
   - Replace database credentials with your Hostinger MySQL details

2. **Update Domain Settings:**
   - Set `NEXT_PUBLIC_API_URL=https://riviso.com/api`
   - Set `NEXT_PUBLIC_APP_URL=https://riviso.com`

3. **Security:**
   - Generate strong secret keys
   - Enable HTTPS
   - Set up proper file permissions

## Testing

1. Visit https://riviso.com
2. Create a test audit
3. Verify all features work correctly

## Troubleshooting

- Check error logs in `/var/log/riviso/`
- Verify database connection
- Ensure all environment variables are set
- Check file permissions (755 for directories, 644 for files)
EOF

print_success "Deployment package created successfully!"
print_status "Next steps:"
echo "1. Upload the 'deployment' folder to your Hostinger server"
echo "2. Follow the instructions in deployment/DEPLOYMENT_INSTRUCTIONS.md"
echo "3. Configure your database and domain settings"
echo "4. Test your live site at https://riviso.com"

print_warning "Don't forget to:"
echo "- Update database credentials in production-config.env"
echo "- Set up SSL certificate for HTTPS"
echo "- Configure your domain DNS settings"
echo "- Test all functionality before going live"

print_success "Deployment package ready! 🎉"
