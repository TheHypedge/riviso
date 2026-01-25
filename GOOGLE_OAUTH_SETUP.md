# Google OAuth Setup Guide for Riviso

## Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "Riviso GSC Integration")

3. **Enable Google Search Console API**
   - In the left menu, go to **APIs & Services** → **Library**
   - Search for "Google Search Console API"
   - Click on it and click **Enable**

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
   - If prompted, configure the OAuth consent screen first:
     - User Type: **External** (for testing) or **Internal** (for Google Workspace)
     - App name: `Riviso`
     - User support email: Your email
     - Developer contact: Your email
     - Click **Save and Continue**
     - Scopes: Click **Add or Remove Scopes**, search for "webmasters", select `https://www.googleapis.com/auth/webmasters.readonly`
     - Click **Save and Continue** → **Save and Continue** → **Back to Dashboard**
   
   - Now create the OAuth Client:
     - Application type: **Web application**
     - Name: `Riviso GSC Integration`
     - **Authorized redirect URIs** (click "Add URI" for each):
       ```
       http://localhost:3000/dashboard/integrations/gsc/callback
       ```
     - Click **Create**
     - **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately (you won't see the secret again!)

### Step 2: Update Environment Variables

1. **Open the backend `.env` file**
   ```bash
   cd apps/backend
   # The .env file should already exist
   ```

2. **Update the Google OAuth values**
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/integrations/gsc/callback
   FRONTEND_URL=http://localhost:3000
   ```

3. **Replace the placeholder values** with the actual values from Google Cloud Console

### Step 3: Restart the Backend Server

After updating the `.env` file, restart the backend server:

```bash
# Stop the current server (Ctrl+C in the terminal running npm run dev)
# Then restart:
npm run dev
```

Or if running separately:
```bash
cd apps/backend
npm run start:dev
```

### Step 4: Test the Connection

1. Go to `http://localhost:3000/dashboard/settings`
2. Scroll to the **Integrations** section
3. Click **Connect** next to "Google Search Console"
4. You should be redirected to Google's OAuth consent screen
5. Sign in and grant permissions
6. You'll be redirected back to the Settings page with "Connected" status

## Troubleshooting

### Error: "Google OAuth not configured"
- Make sure you've added `GOOGLE_CLIENT_ID` to the `.env` file
- Restart the backend server after updating `.env`

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `http://localhost:3000/dashboard/integrations/gsc/callback`
- Check for typos, trailing slashes, or http vs https

### Error: "access_denied"
- User cancelled the OAuth flow
- Try again and make sure to click "Allow" on the consent screen

### Backend not reading .env file
- Make sure the `.env` file is in `/apps/backend/.env` (not in the root)
- Restart the backend server
- Check that the file doesn't have syntax errors

## Production Setup

For production, you'll need to:

1. **Update redirect URIs** in Google Cloud Console:
   ```
   https://your-domain.com/dashboard/integrations/gsc/callback
   ```

2. **Update environment variables**:
   ```env
   GOOGLE_REDIRECT_URI=https://your-domain.com/dashboard/integrations/gsc/callback
   FRONTEND_URL=https://your-domain.com
   ```

3. **Add encryption key** (for secure token storage):
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env`:
   ```env
   ENCRYPTION_KEY=generated-key-here
   ```

## Security Notes

- Never commit the `.env` file to git (it should be in `.gitignore`)
- Keep your Client Secret secure
- In production, use environment variables from your hosting platform
- The redirect URI must exactly match what's configured in Google Cloud Console
