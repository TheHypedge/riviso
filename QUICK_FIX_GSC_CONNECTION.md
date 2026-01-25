# Quick Fix: Google Search Console Connection

## The Problem
You're getting `redirect_uri_mismatch` error when trying to connect Google Search Console.

## The Solution (2 Minutes)

### Step 1: Check What Redirect URI is Being Used

1. **Start your backend** (if not running):
   ```bash
   npm run dev:backend
   ```

2. **Look at the backend logs** when you click "Connect Google Search Console"
   - You should see a line like: `[OAuth] Redirect URI: http://localhost:3000/api/auth/callback/google`
   - **Copy this EXACT URI**

### Step 2: Add to Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Click on your **OAuth 2.0 Client ID** (the one matching your `GOOGLE_CLIENT_ID`)
3. Scroll to **"Authorized redirect URIs"**
4. Click **"+ ADD URI"**
5. Paste: `http://localhost:3000/api/auth/callback/google`
   - **IMPORTANT**: 
     - No trailing slash
     - Exact match (case-sensitive)
     - Use `http://` (not `https://`) for localhost
6. Click **"SAVE"**

### Step 3: Try Again

1. Go back to Settings page
2. Click "Connect Google Search Console" again
3. It should work now!

## Still Not Working?

### Check Your Environment Variables

In `apps/backend/.env`, make sure you have:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
```

**Important**: `FRONTEND_URL` should be exactly `http://localhost:3000` (no trailing slash)

### Verify the Redirect URI

The redirect URI is automatically constructed as:
```
${FRONTEND_URL}/api/auth/callback/google
```

So if `FRONTEND_URL=http://localhost:3000`, the redirect URI will be:
```
http://localhost:3000/api/auth/callback/google
```

This is what must be in Google Cloud Console.

## Common Mistakes

❌ **Wrong**: `http://localhost:3000/api/auth/callback/google/` (trailing slash)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

❌ **Wrong**: `https://localhost:3000/api/auth/callback/google` (https instead of http)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

❌ **Wrong**: `localhost:3000/api/auth/callback/google` (missing http://)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

## Need Help?

Check the backend logs - they will show you the EXACT redirect URI being used. That's what needs to be in Google Cloud Console.
