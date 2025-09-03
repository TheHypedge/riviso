#!/bin/bash

# Simple Hostinger Deployment Script for RIVISO
# This script prepares your files for easy upload to Hostinger

set -e

echo "🚀 Preparing RIVISO for Hostinger Deployment"
echo "============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create deployment directory
print_status "Creating deployment package..."
rm -rf hostinger-deploy
mkdir -p hostinger-deploy

# Build frontend for static hosting
print_status "Building frontend for static hosting..."
cd apps/web

# Set production environment variables
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://riviso.com/api
export NEXT_PUBLIC_APP_URL=https://riviso.com

# Install dependencies and build
pnpm install
pnpm build

# Copy static files
cp -r out/* ../../hostinger-deploy/
cd ../..

print_success "Frontend built successfully!"

# Create environment file template
cat > hostinger-deploy/.env.template << 'EOF'
# Copy this to .env and update with your Hostinger database details

# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/riviso_prod
DB_HOST=localhost
DB_PORT=3306
DB_NAME=riviso_prod
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# Application Settings
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secret-key-here-change-this

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://riviso.com/api
NEXT_PUBLIC_APP_URL=https://riviso.com

# Security
JWT_SECRET=your-jwt-secret-key-here
BCRYPT_ROUNDS=12
EOF

# Create deployment instructions
cat > hostinger-deploy/README.md << 'EOF'
# RIVISO Deployment Instructions for Hostinger

## Quick Start (5 minutes)

### 1. Upload Files
- Upload all files in this folder to your `public_html` directory
- The frontend files are ready for static hosting

### 2. Set up Database (Optional - for full functionality)
1. Go to Hostinger Control Panel → Databases → MySQL
2. Create database: `riviso_prod`
3. Create user with full privileges
4. Copy `.env.template` to `.env`
5. Update `.env` with your database credentials

### 3. Configure Domain
- Point riviso.com to your hosting
- Enable SSL certificate
- Test at https://riviso.com

## Alternative: Use Vercel for Full Stack

For full functionality (including backend API):

1. **Deploy Frontend to Vercel (Free):**
   - Connect your GitHub repo to Vercel
   - Deploy the `apps/web` folder
   - Set environment variables in Vercel

2. **Use Hostinger for Static Hosting:**
   - Upload only the frontend files
   - Update API URL to point to Vercel backend

## Environment Variables for Vercel

```
NEXT_PUBLIC_API_URL=https://your-vercel-backend.vercel.app
NEXT_PUBLIC_APP_URL=https://riviso.com
```

## Troubleshooting

- **Frontend not loading:** Check if files are in public_html
- **API not working:** Use Vercel for backend or set up Python on Hostinger
- **SSL issues:** Wait 24-48 hours for certificate propagation

## Support

- Hostinger Support: Live chat in control panel
- Check error logs in `/var/log/` directory
- Test site at: https://your-domain.com
EOF

# Create .htaccess for Apache
cat > hostinger-deploy/.htaccess << 'EOF'
# RIVISO .htaccess configuration

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Redirect to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA routing - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

print_success "Deployment package created successfully!"
print_status "Files ready in: hostinger-deploy/"
print_warning "Next steps:"
echo "1. Upload the 'hostinger-deploy' folder contents to your public_html"
echo "2. Set up your database in Hostinger control panel (optional)"
echo "3. Configure your domain and SSL certificate"
echo "4. Test your site at https://riviso.com"

print_success "🎉 Your RIVISO SEO audit platform is ready for Hostinger! 🚀"
