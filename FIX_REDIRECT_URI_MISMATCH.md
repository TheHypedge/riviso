# Fix: redirect_uri_mismatch Error

## Problem
You're seeing: **"Error 400: redirect_uri_mismatch"** when trying to connect Google Search Console.

This means the redirect URI in your code doesn't match what's configured in Google Cloud Console.

## Solution

### Step 1: Check What Redirect URI Your Code Is Using

The backend is configured to use:
```
http://localhost:3000/dashboard/integrations/gsc/callback
```

You can verify this by checking the backend logs when you click "Connect" - it will show:
```
GSC OAuth - Redirect URI: http://localhost:3000/dashboard/integrations/gsc/callback
```

### Step 2: Add This Exact URI to Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (the one where you created the OAuth client)

2. **Navigate to OAuth Client Settings**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID (e.g., `your-client-id.apps.googleusercontent.com`)
   - Click on it to edit

3. **Add the Redirect URI**
   - Scroll to **"Authorized redirect URIs"**
   - Click **"+ ADD URI"**
   - Enter this **EXACT** URI (copy-paste to avoid typos):
     ```
     http://localhost:3000/dashboard/integrations/gsc/callback
     ```
   - **Important**: 
     - No trailing slash
     - Use `http://` not `https://` for localhost
     - Match the port (3000)
     - Match the exact path

4. **Save**
   - Click **"SAVE"** at the bottom

### Step 3: Wait a Few Seconds

Google's changes can take 1-2 minutes to propagate. Wait a moment before testing again.

### Step 4: Test Again

1. Go to `http://localhost:3000/dashboard/settings`
2. Click **Connect** next to "Google Search Console"
3. It should now work!

## Common Mistakes

❌ **Wrong:**
- `http://localhost:3000/dashboard/integrations/gsc/callback/` (trailing slash)
- `https://localhost:3000/dashboard/integrations/gsc/callback` (https instead of http)
- `http://127.0.0.1:3000/dashboard/integrations/gsc/callback` (127.0.0.1 instead of localhost)
- `http://localhost:4000/dashboard/integrations/gsc/callback` (wrong port)

✅ **Correct:**
- `http://localhost:3000/dashboard/integrations/gsc/callback`

## Verify Your Configuration

After adding the URI, your Google Cloud Console should show:

**Authorized redirect URIs:**
- `http://localhost:3000/dashboard/integrations/gsc/callback` ✅

## Still Not Working?

1. **Check backend logs** - Look for the log message showing the redirect URI being used
2. **Double-check the URI** - Make sure there are no extra spaces or characters
3. **Try clearing browser cache** - Sometimes cached OAuth errors persist
4. **Wait 2-3 minutes** - Google's changes can take time to propagate

## For Production

When deploying to production, you'll need to add your production redirect URI:
```
https://your-domain.com/dashboard/integrations/gsc/callback
```

And update the `.env` file:
```env
GOOGLE_REDIRECT_URI=https://your-domain.com/dashboard/integrations/gsc/callback
```
