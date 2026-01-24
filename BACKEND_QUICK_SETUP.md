# Backend Deployment - Quick Setup

## 🚂 Railway Deployment (Recommended)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project
```bash
cd /Volumes/Work/riviso/apps/backend
railway init
```

### 4. Add PostgreSQL
```bash
railway add --plugin postgresql
```

### 5. Add Redis
```bash
railway add --plugin redis
```

### 6. Set Environment Variables
```bash
railway variables set CORS_ORIGIN=https://riviso.com
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
railway variables set PORT=4000
```

### 7. Deploy
```bash
railway up
```

### 8. Get Your URL
```bash
railway domain
```

---

## 🔗 Connect to Frontend

### Update Vercel Environment Variable

```bash
# Go to: https://vercel.com/hypedges-projects/riviso/settings/environment-variables

# Update NEXT_PUBLIC_API_URL to:
https://your-backend-url.railway.app/api
```

Then redeploy frontend on Vercel.

---

## ✅ Test Full Stack

1. Visit: https://riviso.com
2. Click "Login"
3. Create account / Login
4. Test dashboard features

All features should now work with the backend connected!

---

## 📝 Backend URL Examples

**Railway**: `https://riviso-backend-production.up.railway.app`  
**Render**: `https://riviso-backend.onrender.com`

Use these in Vercel as:
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```
