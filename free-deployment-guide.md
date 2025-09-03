# 🚀 Free Deployment Guide: Vercel + Railway

Deploy your RIVISO SEO audit platform completely free using Vercel (frontend) and Railway (backend).

## 💰 **Cost Breakdown**
- **Vercel**: Free tier (unlimited personal projects)
- **Railway**: Free tier ($5 credit monthly)
- **Domain**: $10-15/year (riviso.com)
- **Total**: ~$10-15/year (just domain cost!)

## 🎯 **Step 1: Push to GitHub**

### 1.1 Initialize Git Repository
```bash
# Navigate to your project
cd /Users/akhileshsoni/seo-audit

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: RIVISO SEO Analytics Platform

- Complete Next.js frontend with audit dashboard
- FastAPI backend with comprehensive SEO analysis
- Top Keywords analysis feature
- Real-time audit progress tracking
- Responsive design with Tailwind CSS
- Production-ready deployment configurations"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `riviso`
3. Make it public
4. Don't initialize with README (we already have one)

### 1.3 Push to GitHub
```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/riviso.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🎨 **Step 2: Deploy Frontend to Vercel**

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your `riviso` repository

### 2.2 Configure Vercel Project
**Project Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_APP_URL=https://riviso.com
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend will be live at: `https://riviso-xxx.vercel.app`

## ⚙️ **Step 3: Deploy Backend to Railway**

### 3.1 Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `riviso` repository

### 3.2 Configure Railway Service
**Service Settings:**
- **Root Directory**: `services/audit-api`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
```
ENVIRONMENT=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/railway
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
CORS_ORIGINS=https://riviso.com,https://www.riviso.com,https://riviso-xxx.vercel.app
```

### 3.3 Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL` environment variable

### 3.4 Deploy
1. Railway will automatically deploy when you push to GitHub
2. Your backend will be live at: `https://your-project.railway.app`

## 🔗 **Step 4: Connect Frontend and Backend**

### 4.1 Update Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Railway backend URL:
```
NEXT_PUBLIC_API_URL=https://your-project.railway.app
```

### 4.2 Redeploy Frontend
1. In Vercel, go to Deployments
2. Click "Redeploy" on the latest deployment
3. Your frontend will now connect to your backend

## 🌐 **Step 5: Configure Custom Domain (riviso.com)**

### 5.1 Add Domain to Vercel
1. Go to your Vercel project dashboard
2. Go to Settings → Domains
3. Add `riviso.com` and `www.riviso.com`
4. Vercel will provide DNS instructions

### 5.2 Update Domain DNS
In your domain registrar (where you bought riviso.com):
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Update Environment Variables
Update Vercel environment variables:
```
NEXT_PUBLIC_API_URL=https://your-project.railway.app
NEXT_PUBLIC_APP_URL=https://riviso.com
```

## 🧪 **Step 6: Test Your Deployment**

### 6.1 Test Frontend
1. Visit `https://riviso.com`
2. Check if the homepage loads
3. Try creating an audit

### 6.2 Test Backend
1. Visit `https://your-project.railway.app/health`
2. Should return: `{"status": "healthy"}`

### 6.3 Test Full Flow
1. Go to `https://riviso.com`
2. Enter a website URL
3. Click "Start RIVISO Analysis"
4. Wait for audit to complete
5. Verify all features work

## 🔧 **Step 7: Database Setup**

### 7.1 Run Migrations
Railway will automatically handle database setup, but you can run migrations manually:

```bash
# Connect to Railway CLI (optional)
railway login
railway link your-project

# Run migrations
railway run alembic upgrade head
```

## 📊 **Step 8: Monitoring and Maintenance**

### 8.1 Vercel Analytics
1. Enable Vercel Analytics in your project
2. Monitor performance and usage

### 8.2 Railway Monitoring
1. Check Railway dashboard for logs
2. Monitor resource usage
3. Set up alerts if needed

## 🚨 **Troubleshooting**

### Issue 1: Frontend Not Loading
- Check Vercel deployment logs
- Verify environment variables
- Check domain DNS settings

### Issue 2: Backend API Not Working
- Check Railway deployment logs
- Verify environment variables
- Test API endpoint directly

### Issue 3: Database Connection Issues
- Check Railway PostgreSQL service
- Verify `DATABASE_URL` environment variable
- Check database logs in Railway

### Issue 4: CORS Errors
- Update `CORS_ORIGINS` in Railway environment variables
- Include your Vercel domain and custom domain

## 🎉 **Success Checklist**

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database connected
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Full audit flow working
- [ ] Performance optimized

## 💡 **Pro Tips**

1. **Automatic Deployments**: Both Vercel and Railway auto-deploy on git push
2. **Environment Variables**: Keep sensitive data in environment variables
3. **Monitoring**: Set up alerts for downtime
4. **Backups**: Railway automatically backs up your database
5. **Scaling**: Both platforms auto-scale based on traffic

## 🔄 **Future Updates**

To update your live site:
1. Make changes to your code
2. Commit and push to GitHub
3. Vercel and Railway will automatically redeploy
4. Your changes will be live in minutes!

---

**🎯 Your RIVISO platform will be live at https://riviso.com!**
