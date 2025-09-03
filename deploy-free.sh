#!/bin/bash

# Free Deployment Script for RIVISO
# Deploy to Vercel (frontend) + Railway (backend)

set -e

echo "🚀 RIVISO Free Deployment Setup"
echo "================================"

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

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: RIVISO SEO Analytics Platform

- Complete Next.js frontend with audit dashboard
- FastAPI backend with comprehensive SEO analysis
- Top Keywords analysis feature
- Real-time audit progress tracking
- Responsive design with Tailwind CSS
- Production-ready deployment configurations"
    print_success "Git repository initialized!"
else
    print_status "Git repository already exists"
fi

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    print_warning "No GitHub remote found!"
    echo ""
    echo "Please create a GitHub repository and add it as remote:"
    echo "1. Go to https://github.com and create a new repository named 'riviso'"
    echo "2. Run: git remote add origin https://github.com/yourusername/riviso.git"
    echo "3. Run: git push -u origin main"
    echo ""
    read -p "Press Enter when you've added the GitHub remote..."
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git add .
git commit -m "Update: Add deployment configurations for Vercel and Railway" || true
git push origin main
print_success "Code pushed to GitHub!"

echo ""
print_success "🎉 Setup Complete! Next Steps:"
echo ""
echo "1. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set Root Directory to: apps/web"
echo "   - Add environment variables:"
echo "     NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app"
echo "     NEXT_PUBLIC_APP_URL=https://riviso.com"
echo ""
echo "2. ⚙️ Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Import your GitHub repository"
echo "   - Set Root Directory to: services/audit-api"
echo "   - Add PostgreSQL database"
echo "   - Add environment variables:"
echo "     ENVIRONMENT=production"
echo "     SECRET_KEY=your-secret-key"
echo "     CORS_ORIGINS=https://riviso.com,https://your-vercel-app.vercel.app"
echo ""
echo "3. 🔗 Connect Frontend and Backend:"
echo "   - Update Vercel environment variables with Railway backend URL"
echo "   - Redeploy Vercel project"
echo ""
echo "4. 🌍 Configure Custom Domain:"
echo "   - Add riviso.com to Vercel project"
echo "   - Update DNS settings in your domain registrar"
echo ""
echo "📖 Detailed instructions: See free-deployment-guide.md"
echo ""
print_success "Your RIVISO platform will be live at https://riviso.com! 🚀"
