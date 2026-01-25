# Google Search Console Connection Fix

## Problem: `redirect_uri_mismatch` Error

You're seeing this error because the redirect URI in your Google Cloud Console doesn't match the exact URI being sent by the application.

## Current Configuration

The application uses this redirect URI:
```
http://localhost:3000/api/auth/callback/google
```

## Step-by-Step Fix

### 1. Check Backend Logs

When you click "Connect Google Search Console", check your backend logs. You should see:
```
[OAuth] Redirect URI: http://localhost:3000/api/auth/callback/google
[OAuth] IMPORTANT: Ensure this redirect URI is added in Google Cloud Console: http://localhost:3000/api/auth/callback/google
```

**Copy the exact URI from the logs** - this is what needs to be in Google Cloud Console.

### 2. Add Redirect URI to Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Select your project (the one with your OAuth credentials)
3. Click on your **OAuth 2.0 Client ID** (the one you're using)
4. Scroll to **"Authorized redirect URIs"**
5. Click **"+ ADD URI"**
6. **Paste the EXACT URI from your backend logs** (usually: `http://localhost:3000/api/auth/callback/google`)
7. **Important**: 
   - No trailing slash
   - Exact match (case-sensitive)
   - Include `http://` (not `https://` for localhost)
   - Full path: `/api/auth/callback/google`
8. Click **"SAVE"**

### 3. Verify Environment Variables

Check your `apps/backend/.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
```

**Important**: 
- `FRONTEND_URL` should be `http://localhost:3000` (no trailing slash)
- The redirect URI is automatically constructed as: `${FRONTEND_URL}/api/auth/callback/google`

### 4. Restart Backend

After updating Google Cloud Console:
```bash
# Stop the backend
# Then restart
npm run dev:backend
```

### 5. Test the Connection

1. Go to Settings page: `http://localhost:3000/dashboard/settings`
2. Find "Google Search Console" integration
3. Click "Connect"
4. You should be redirected to Google's consent screen
5. After granting permissions, you'll be redirected back and connected

## Common Issues

### Issue 1: URI Still Doesn't Match

**Solution**: Check backend logs for the exact URI being generated. It should be:
```
http://localhost:3000/api/auth/callback/google
```

If it's different, check your `FRONTEND_URL` environment variable.

### Issue 2: Multiple Redirect URIs

If you have multiple redirect URIs in Google Cloud Console, make sure the exact one from your logs is there. Google is very strict about exact matches.

### Issue 3: Wrong OAuth Client

Make sure you're editing the correct OAuth 2.0 Client ID in Google Cloud Console. The Client ID should match what's in your `.env` file.

### Issue 4: Production vs Development

For production, you'll need to add:
```
https://your-domain.com/api/auth/callback/google
```

Make sure to update `FRONTEND_URL` in production environment.

## Verification

After adding the redirect URI:

1. **Backend logs** should show the redirect URI when you click "Connect"
2. **Google Cloud Console** should list the exact URI in "Authorized redirect URIs"
3. **OAuth flow** should complete without `redirect_uri_mismatch` error

## Still Having Issues?

1. Check backend logs for the exact redirect URI
2. Verify it's added in Google Cloud Console (exact match)
3. Ensure `FRONTEND_URL` is set correctly in `.env`
4. Restart backend after any changes
5. Clear browser cache and try again
