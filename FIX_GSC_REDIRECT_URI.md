# Fix Google Search Console Connection - redirect_uri_mismatch

## Quick Fix (2 Minutes)

### Step 1: Check Backend Logs

When you click "Connect Google Search Console", check your backend terminal. You should see:

```
[OAuth Config] Redirect URI configured: http://localhost:3000/api/auth/callback/google
[OAuth Config] ⚠️  Make sure this EXACT URI is in Google Cloud Console: http://localhost:3000/api/auth/callback/google
[DEBUG] Redirect URI being used: http://localhost:3000/api/auth/callback/google
```

**Copy the exact URI** from the logs (it should be: `http://localhost:3000/api/auth/callback/google`)

### Step 2: Add to Google Cloud Console

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select your project** (the one with your OAuth credentials)
3. **Click on your OAuth 2.0 Client ID** (the one matching your `GOOGLE_CLIENT_ID` in `.env`)
4. **Scroll down** to **"Authorized redirect URIs"**
5. **Click "+ ADD URI"**
6. **Paste this EXACT URI**: `http://localhost:3000/api/auth/callback/google`
   - ⚠️ **CRITICAL**: Must be EXACT match
   - No trailing slash
   - Use `http://` (not `https://`) for localhost
   - Full path: `/api/auth/callback/google`
7. **Click "SAVE"**

### Step 3: Verify Environment Variables

Check `apps/backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
```

**Important**: 
- `FRONTEND_URL` should be exactly `http://localhost:3000` (no trailing slash)
- The redirect URI is automatically: `${FRONTEND_URL}/api/auth/callback/google`

### Step 4: Restart Backend

After updating Google Cloud Console:

```bash
# Stop backend (Ctrl+C)
# Then restart
npm run dev:backend
```

### Step 5: Try Again

1. Go to: `http://localhost:3000/dashboard/settings`
2. Find "Google Search Console"
3. Click "Connect"
4. Should work now! ✅

## Diagnostic Endpoint

You can also check the OAuth configuration via API:

```bash
# After logging in, call:
GET /api/v1/integrations/gsc/oauth-config
```

This will show you the exact redirect URI and step-by-step instructions.

## Common Issues

### Issue: Still Getting redirect_uri_mismatch

**Check**:
1. Backend logs show the exact redirect URI
2. Google Cloud Console has the EXACT same URI (character-by-character match)
3. No trailing slash
4. Correct protocol (`http://` for localhost)
5. Restarted backend after changes

### Issue: Multiple OAuth Clients

Make sure you're editing the **correct** OAuth Client ID - the one that matches your `GOOGLE_CLIENT_ID` in `.env`.

### Issue: Production vs Development

For production, you'll need:
- `FRONTEND_URL=https://your-domain.com`
- Add `https://your-domain.com/api/auth/callback/google` to Google Cloud Console

## Still Not Working?

1. **Check backend logs** - they show the exact redirect URI
2. **Verify in Google Cloud Console** - the URI must match exactly
3. **Clear browser cache** - sometimes cached OAuth errors persist
4. **Try incognito mode** - to rule out browser cache issues

The redirect URI is: `http://localhost:3000/api/auth/callback/google`

Make sure this EXACT string is in Google Cloud Console's "Authorized redirect URIs" list.
