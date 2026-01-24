# Riviso - Production Deployment Guide

## ✅ Build Status
- **Last Build**: Successful ✓
- **Build Time**: ~12 seconds
- **Total Routes**: 16 pages
- **First Load JS**: 84.5 kB (shared)
- **Framework**: Next.js 14.1.0
- **Node.js Version**: 20.x (recommended for Vercel)

## 🚀 Production Configuration

### Security Features
- ✅ Strict Transport Security (HSTS)
- ✅ Content Security Headers
- ✅ XSS Protection
- ✅ Frame Options (SAMEORIGIN)
- ✅ DNS Prefetch Control
- ✅ Referrer Policy

### Performance Optimizations
- ✅ SWC Minification enabled
- ✅ Console removal in production (except errors/warnings)
- ✅ Gzip compression
- ✅ Static page generation (all 16 pages pre-rendered)
- ✅ Image optimization (AVIF, WebP)
- ✅ Automatic code splitting

## 📦 Deployment to Vercel

### Step 1: Update Vercel Project Settings
The build is failing because of incorrect root directory settings. Follow these steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `riviso` project
3. Navigate to **Settings** → **General**
4. Update **Root Directory**:
   - Current (incorrect): `apps/web` ❌
   - Change to: `apps/frontend` ✅
5. Click **Save**

### Step 2: Verify Build Settings
Ensure these settings in Vercel dashboard:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 20.x
```

### Step 3: Set Environment Variables (Optional)
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Step 4: Deploy
After updating settings:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for automatic deployment to complete

## 📊 Build Output Summary

```
Route (app)                               Size     First Load JS
┌ ○ /                                     176 B          91.4 kB
├ ○ /auth/login                           1.99 kB         115 kB
├ ○ /auth/register                        2.1 kB          115 kB
├ ○ /dashboard                            106 kB          224 kB
├ ○ /dashboard/ai                         6.46 kB         124 kB
├ ○ /dashboard/competitors                3.42 kB         121 kB
├ ○ /dashboard/cro                        6.48 kB         124 kB
├ ○ /dashboard/integrations               4.82 kB         122 kB
├ ○ /dashboard/keywords                   3.22 kB         121 kB
├ ○ /dashboard/seo                        3.52 kB         121 kB
├ ○ /dashboard/settings                   3.09 kB         120 kB
└ ○ /dashboard/website-analyzer           13.6 kB         131 kB

All pages are statically optimized (○ Static)
```

## 🔒 Security Notes

1. **Deployment Protection**: Currently disabled. Enable in Vercel Settings → Deployment Protection
2. **Environment Variables**: Never commit `.env` files. Use Vercel's environment variable management
3. **HTTPS**: Automatically enforced by Vercel with free SSL certificates

## 🛠️ Local Testing

To test the production build locally:

```bash
# Build
cd apps/frontend
npm run build

# Start production server
npm start

# Visit http://localhost:3000
```

## 📝 Recent Changes

- ✅ Fixed Node.js version compatibility (20.x)
- ✅ Added production security headers
- ✅ Configured image optimization
- ✅ Enabled SWC minification
- ✅ Added console log removal for production
- ✅ Created `.vercelignore` for optimized deployments
- ✅ Updated `vercel.json` with production-ready configuration

## 🔍 Troubleshooting

### Build Fails with "Root Directory not found"
- Update Vercel project settings to use `apps/frontend` instead of `apps/web`

### Node.js Version Warning
- Ensure Node.js 20.x is selected in Vercel project settings

### Environment Variables Not Working
- Prefix browser-accessible variables with `NEXT_PUBLIC_`
- Set them in Vercel Dashboard → Environment Variables

## 📞 Support

For deployment issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Ensure all required environment variables are set

---

**Status**: Production Ready ✅  
**Last Updated**: January 24, 2026  
**Build Test**: Passed ✓
