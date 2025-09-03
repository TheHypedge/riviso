# 🚀 RIVISO Deployment Guide

## Overview
Deploy your RIVISO SEO audit platform to production using free services:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (FastAPI)
- **Domain**: riviso.com

## 🎯 Quick Start

### 1. Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select your `riviso` repository**
5. **Configure project settings:**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: cd apps/web && npm run build
   Output Directory: apps/web/.next
   Install Command: npm install
   ```
6. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
   ```
7. **Click "Deploy"**

### 2. Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" > "Deploy from GitHub repo"**
4. **Select your `riviso` repository**
5. **Set Root Directory: `services/audit-api`**
6. **Add Environment Variables:**
   ```
   DATABASE_URL=sqlite:///./seo_audit.db
   REDIS_URL=redis://localhost:6379
   PORT=8000
   ```
7. **Deploy**

### 3. Configure Domain

1. **In Vercel dashboard:**
   - Go to your project
   - Settings > Domains
   - Add `riviso.com`
   
2. **Update DNS settings:**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.61`

## 🔧 Environment Variables

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
```

### Railway (Backend)
```
DATABASE_URL=sqlite:///./seo_audit.db
REDIS_URL=redis://localhost:6379
PORT=8000
```

## 📱 Features After Deployment

✅ **SEO Audit Dashboard**
✅ **Real-time Progress Tracking**
✅ **Top Keywords Analysis**
✅ **Comprehensive SEO Rules**
✅ **Responsive Design**
✅ **Performance Monitoring**

## 🌐 Live URLs

- **Frontend**: https://riviso.com
- **Backend API**: https://your-railway-backend-url.railway.app
- **GitHub**: https://github.com/TheHypedge/riviso

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails on Vercel:**
   - Check Root Directory is set to `apps/web`
   - Verify Build Command includes `cd apps/web`

2. **Backend Not Starting on Railway:**
   - Ensure Root Directory is `services/audit-api`
   - Check Environment Variables are set

3. **Domain Not Working:**
   - Verify DNS settings
   - Check Vercel domain configuration

## 📞 Support

If you encounter issues:
1. Check the deployment logs in Vercel/Railway
2. Verify all environment variables are set
3. Ensure GitHub repository is properly connected

---

**Your RIVISO platform will be live at: https://riviso.com** 🎉
