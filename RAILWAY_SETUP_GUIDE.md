# Railway Setup - Quick Reference

## ✅ Code Changes Pushed

Your backend is now configured to work with Railway's automatic database provisioning!

---

## 🗄️ Step 1: Add Databases in Railway

### Add PostgreSQL

1. Go to your Railway project dashboard
2. Click **"+ New"** (top right)
3. Select **"Database"** → **"PostgreSQL"**
4. Railway automatically creates it

### Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Redis"**
3. Railway automatically creates it

---

## 🔗 Step 2: Railway Auto-Links Databases

Railway will automatically inject these environment variables into your "web" service:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**No manual configuration needed!** Your backend code now automatically parses these URLs.

---

## 🔧 Step 3: Add Additional Variables

Go to your **"web" service** → **"Variables" tab** and add:

```bash
NODE_ENV=production
CORS_ORIGIN=https://riviso.com
JWT_SECRET=<paste output from command below>
JWT_REFRESH_SECRET=<paste output from command below>
BACKEND_PORT=4000
```

### Generate JWT Secrets

Run locally to generate secure secrets:
```bash
openssl rand -base64 32
```

Copy the output twice (once for each secret).

---

## 🌐 Step 4: Get Backend URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://web-production-xyz.up.railway.app`)

---

## 🔗 Step 5: Connect Frontend

### Update Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **riviso** project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_URL`:
   ```
   https://your-railway-url.up.railway.app/api
   ```
5. Apply to: **Production, Preview, Development**
6. **Save** and **Redeploy**

---

## ✅ Final Checklist

- [ ] PostgreSQL database added in Railway
- [ ] Redis database added in Railway
- [ ] Environment variables set (NODE_ENV, CORS_ORIGIN, JWT secrets)
- [ ] Backend domain generated
- [ ] Frontend NEXT_PUBLIC_API_URL updated in Vercel
- [ ] Frontend redeployed

---

## 🧪 Test Your Full Stack

### 1. Test Backend Health

Visit:
```
https://your-railway-url.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "info": {...}
}
```

### 2. Test Frontend

Visit:
```
https://riviso.com
```

Click "Login" and test authentication.

---

## 🎉 You're Done!

Your full stack is now connected:
- ✅ Frontend: Vercel (riviso.com)
- ✅ Backend: Railway (with PostgreSQL & Redis)
- ✅ Database: Automatic provisioning
- ✅ SSL: Enabled on all connections

---

## 🆘 Troubleshooting

### Backend won't start

Check Railway **Logs** tab for errors. Common issues:
- Missing environment variables
- Database connection failures
- Port conflicts

### Frontend can't connect to backend

1. Verify `NEXT_PUBLIC_API_URL` in Vercel
2. Check CORS_ORIGIN in Railway matches `https://riviso.com`
3. Ensure backend domain is generated and accessible

### Database connection errors

1. Verify DATABASE_URL exists in Variables tab
2. Check Railway logs for connection errors
3. Ensure PostgreSQL service is running (green status)

---

## 📝 Environment Variables Summary

### Railway (Backend)

**Auto-injected by Railway:**
- `DATABASE_URL` - from PostgreSQL service
- `REDIS_URL` - from Redis service

**Manual:**
- `NODE_ENV=production`
- `CORS_ORIGIN=https://riviso.com`
- `JWT_SECRET=<generated>`
- `JWT_REFRESH_SECRET=<generated>`
- `BACKEND_PORT=4000`

### Vercel (Frontend)

- `NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api`

---

Good luck! 🚀
