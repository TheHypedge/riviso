# GSC Integration - Issues Fixed ✅

## What Was Wrong

1. **❌ Frontend using wrong token**: Was using `'token'` instead of `'accessToken'`
2. **❌ Backend using mock service**: Was not using the production OAuth service
3. **❌ Missing types**: GSC types weren't in shared-types package

## What I Fixed

### 1. Frontend Token Issues ✅
- **File**: `/apps/frontend/src/app/dashboard/integrations/page.tsx`
- **Fixed**: Changed `localStorage.getItem('token')` to `localStorage.getItem('accessToken')` in 3 places
- **Added**: Better error handling and logging

### 2. Backend Production Service ✅
- **File**: `/apps/backend/src/modules/integrations/services/gsc.service.ts`
- **Fixed**: Replaced mock service with production OAuth implementation
- **Added**: Database persistence, token encryption, auto-refresh

### 3. Shared Types ✅
- **File**: `/packages/shared-types/src/gsc.ts` (NEW)
- **Added**: Complete GSC type definitions
- **Exported**: All types from shared-types package

### 4. Module Configuration ✅
- **File**: `/apps/backend/src/modules/integrations/integrations.module.ts`
- **Added**: TypeORM integration for GSC entity
- **Added**: GSC repository provider

### 5. Database Entity ✅
- **File**: `/apps/backend/src/infrastructure/database/entities/gsc-integration.entity.ts`
- **Created**: GSC integration entity with encryption support

## How to Test Now

### Step 1: Restart Backend

```bash
cd /Volumes/Work/riviso/apps/backend

# Set environment variables
export NODE_ENV=development
export BACKEND_PORT=4000
export JWT_SECRET=dev-secret-key
export CORS_ORIGIN=http://localhost:3000
export ENCRYPTION_KEY=test-encryption-key-32-chars-long
export GOOGLE_CLIENT_ID=demo-client-id
export GOOGLE_CLIENT_SECRET=demo-secret
export GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/integrations/gsc/callback

# Start backend
npm run start:dev
```

### Step 2: Test in Browser

1. Open **Chrome DevTools** (F12)
2. Go to **Console** tab
3. Navigate to `http://localhost:3000/dashboard/integrations`
4. Click **"Connect GSC"**  button
5. Watch the console for logs

### Expected Console Output

```
Auth URL received: https://accounts.google.com/o/oauth2/v2/auth?client_id=demo-client-id&...
```

Then the page should redirect to Google OAuth.

## Current Limitation

**⚠️ Using Demo OAuth Credentials**

The current setup uses `demo-client-id` which won't work with real Google OAuth. To connect for real:

### Get Real Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Search Console API**
3. Create **OAuth 2.0 Client ID**
4. Add redirect URI: `http://localhost:3000/dashboard/integrations/gsc/callback`
5. Copy Client ID and Secret

### Update Backend .env

Create `/apps/backend/.env` with:

```env
# Real Google OAuth credentials
GOOGLE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-real-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/integrations/gsc/callback

# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=your-secure-32-character-key
```

## Debugging

### Check if Backend is Running

```bash
lsof -ti:4000
# Should return a process ID
```

### Check Backend Logs

```bash
cd /Volumes/Work/riviso/apps/backend
npm run start:dev
# Watch for "Backend API running on port 4000"
```

### Check Browser Console

Open DevTools Console and look for:
- `Auth URL received: ...` (good sign)
- `Error connecting GSC: ...` (shows error details)
- Network tab → check `/api/v1/integrations/gsc/auth-url` request

### Check Network Tab

1. Open DevTools → Network tab
2. Click "Connect GSC"
3. Look for request to `/api/v1/integrations/gsc/auth-url`
4. Check:
   - Status: Should be 200
   - Response: Should have `{ "authUrl": "https://..." }`

## Files Changed

```
✅ apps/frontend/src/app/dashboard/integrations/page.tsx
✅ apps/backend/src/modules/integrations/services/gsc.service.ts
✅ apps/backend/src/modules/integrations/integrations.module.ts
✅ apps/backend/src/modules/integrations/integrations.controller.ts
✅ apps/backend/src/infrastructure/database/entities/gsc-integration.entity.ts
✅ apps/backend/src/infrastructure/database/repositories/gsc-integration.repository.ts
✅ apps/backend/src/common/utils/encryption.util.ts
✅ packages/shared-types/src/gsc.ts (NEW)
✅ packages/shared-types/src/index.ts
```

## Next Steps

1. **Restart backend** with environment variables
2. **Open browser console** to see logs
3. **Click "Connect GSC"** button
4. **Check console** for "Auth URL received"
5. If you see the auth URL → **Get real Google OAuth credentials**
6. If you see errors → **Check backend logs** and share them

## Quick Test Command

Run this in terminal while backend is running:

```bash
# Test the auth-url endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/v1/integrations/gsc/auth-url

# Should return:
# {"authUrl":"https://accounts.google.com/o/oauth2/v2/auth?..."}
```

## Need Help?

If still not working:
1. Open browser DevTools Console
2. Click "Connect GSC"
3. Screenshot any errors
4. Check backend terminal for error messages
5. Share both so I can help debug further
