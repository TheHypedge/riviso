# Backend Deployment Guide - Riviso Full Stack

## 🎯 Overview

Your backend is a NestJS application that requires:
- **PostgreSQL** - Main database
- **Redis** - Caching layer
- **OpenSearch** - Search functionality (optional for MVP)

---

## ✅ RECOMMENDED: Deploy to Railway

Railway provides the easiest setup with automatic database provisioning.

### Step 1: Prepare Backend for Deployment

#### 1.1 Create Production Environment Variables Template

Create `apps/backend/.env.production.example`:
```env
# Database
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=riviso

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRATION=7d

# API
PORT=4000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://riviso.com

# OpenSearch (Optional - can add later)
OPENSEARCH_NODE=
OPENSEARCH_USERNAME=
OPENSEARCH_PASSWORD=
```

#### 1.2 Update main.ts for Production

Check `apps/backend/src/main.ts` has CORS configured:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

#### 1.3 Create Dockerfile (if not exists)

`apps/backend/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm install --production

# Copy backend source
COPY apps/backend ./apps/backend
COPY packages ./packages

# Build backend
RUN npm run build:backend

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
```

---

## 🚂 OPTION 1: Railway (Recommended - Easiest)

### Why Railway?
- ✅ Automatic PostgreSQL & Redis provisioning
- ✅ Free tier available
- ✅ Easy environment variable management
- ✅ GitHub integration
- ✅ Automatic deployments

### Setup Steps:

#### 1. Sign Up for Railway
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Create a new project

#### 2. Deploy from GitHub
```bash
# In Railway Dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose "TheHypedge/riviso"
4. Select the backend service
```

#### 3. Add PostgreSQL Database
```bash
1. Click "+ New" in your project
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision it
4. Connection URL will be auto-injected as DATABASE_URL
```

#### 4. Add Redis
```bash
1. Click "+ New" in your project
2. Select "Database" → "Redis"
3. Railway will automatically provision it
4. Connection URL will be auto-injected as REDIS_URL
```

#### 5. Configure Environment Variables
```bash
# In Railway → Your Backend Service → Variables:
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://riviso.com
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
```

#### 6. Configure Build Settings
```bash
# In Railway → Settings:
Root Directory: apps/backend
Build Command: npm run build
Start Command: npm run start:prod
```

#### 7. Get Your Backend URL
```bash
# Railway will provide a URL like:
https://riviso-backend-production.up.railway.app
```

---

## 🎨 OPTION 2: Render

### Setup Steps:

#### 1. Sign Up for Render
- Go to [render.com](https://render.com)
- Sign up with GitHub

#### 2. Create PostgreSQL Database
```bash
1. Click "New +" → "PostgreSQL"
2. Name: riviso-db
3. Select free tier
4. Create Database
5. Copy the "Internal Database URL"
```

#### 3. Create Redis Instance
```bash
1. Click "New +" → "Redis"
2. Name: riviso-redis
3. Select free tier
4. Create Redis
5. Copy the "Internal Redis URL"
```

#### 4. Create Web Service
```bash
1. Click "New +" → "Web Service"
2. Connect your GitHub repo: TheHypedge/riviso
3. Configure:
   - Name: riviso-backend
   - Root Directory: apps/backend
   - Environment: Node
   - Build Command: npm install && npm run build
   - Start Command: npm run start:prod
```

#### 5. Add Environment Variables
```bash
DATABASE_URL=<from-step-2>
REDIS_URL=<from-step-3>
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://riviso.com
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
```

---

## 🔗 Connect Frontend to Backend

### Step 1: Update Vercel Environment Variable

```bash
# In Vercel Dashboard → riviso → Settings → Environment Variables:

Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-url.railway.app/api
# or
Value: https://riviso-backend.onrender.com/api

Apply to: Production, Preview, Development
```

### Step 2: Redeploy Frontend
```bash
# In Vercel → Deployments → Redeploy
```

### Step 3: Test the Connection

Visit your site and check browser console:
```bash
https://riviso.com
# Open DevTools → Console
# Should see API calls to your backend URL
```

---

## 🧪 Testing Full Stack

### Test Authentication
```bash
# Visit: https://riviso.com/auth/login
# Try to login
# Check Network tab for API calls to your backend
```

### Test API Health
```bash
# Visit your backend directly:
https://your-backend-url.railway.app/api/v1/health

# Should return:
{
  "status": "ok",
  "info": {...},
  "details": {...}
}
```

---

## 🔐 Security Checklist

- ✅ Set strong JWT secrets (use password generator)
- ✅ Configure CORS to only allow riviso.com
- ✅ Use HTTPS for all connections
- ✅ Store secrets in environment variables (never in code)
- ✅ Enable DATABASE_SSL in production
- ✅ Use strong database passwords

---

## 📊 Database Migration

Once backend is deployed, run migrations:

```bash
# Option 1: Through Railway CLI
railway run npm run migration:run

# Option 2: Through Render Shell
# In Render Dashboard → Shell → Run:
npm run migration:run
```

---

## 🚀 Quick Start Command Summary

### For Railway:
```bash
1. Create Railway account
2. New Project → Deploy from GitHub → Select repo
3. Add PostgreSQL database
4. Add Redis database
5. Configure environment variables
6. Deploy!
```

### Update Frontend:
```bash
1. Vercel → Environment Variables
2. Set NEXT_PUBLIC_API_URL=<your-backend-url>/api
3. Redeploy frontend
```

---

## ⚡ Cost Breakdown

### Free Tier Options:

**Railway** (Free tier):
- $5 free credit/month
- PostgreSQL: Included
- Redis: Included
- Good for: MVP & testing

**Render** (Free tier):
- PostgreSQL: Free (limited)
- Redis: Free (limited)
- Web Service: Free (spins down after inactivity)
- Good for: MVP & testing

### Paid Recommendations (When scaling):

**Railway** ($20/month):
- Production-grade database
- Always-on services
- Better performance

**Render** ($7-25/month):
- Persistent services
- Better database limits
- Good performance

---

## 📝 Next Steps

1. **Choose platform** (Railway recommended)
2. **Deploy backend** following steps above
3. **Update frontend** NEXT_PUBLIC_API_URL in Vercel
4. **Test authentication** and API calls
5. **Run database migrations**
6. **Test full application** flow

---

## 🆘 Need Help?

Common issues:
- **CORS errors**: Check FRONTEND_URL in backend env
- **Database connection**: Verify DATABASE_URL format
- **API not responding**: Check backend logs in Railway/Render
- **401 errors**: Check JWT_SECRET is set correctly

Let me know which platform you choose and I'll help with the specific setup!
