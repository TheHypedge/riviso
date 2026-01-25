# Google OAuth 2.0 Integration - Fix Summary

## Root Cause of `redirect_uri_mismatch`

The error occurred because:
1. **Hardcoded redirect URIs** were scattered across multiple services
2. **Inconsistent redirect URI paths** between what the code sent and what was configured in Google Cloud Console
3. **No centralized OAuth configuration** - each service constructed URLs independently
4. **Environment variable mismatch** - `GOOGLE_REDIRECT_URI` was set but not consistently used

## What Was Fixed

### 1. **Centralized OAuth Configuration** ✅
- **Created**: `/apps/backend/src/common/config/oauth.config.ts`
- **Purpose**: Single source of truth for all OAuth settings
- **Features**:
  - Validates all required environment variables
  - Constructs redirect URI from `FRONTEND_URL` + standardized path
  - Provides scope management for different Google services
  - Defensive logging for debugging

### 2. **Standardized Redirect URI** ✅
- **New Path**: `/api/auth/callback/google`
- **Full URI**: `http://localhost:3000/api/auth/callback/google`
- **Construction**: `FRONTEND_URL` + `/api/auth/callback/google`
- **No hardcoded URLs**: All derived from environment variables

### 3. **Refactored GSC Service** ✅
- **Updated**: `/apps/backend/src/modules/integrations/services/gsc.service.ts`
- **Changes**:
  - Uses `OAuthConfig` instead of direct `ConfigService`
  - Removed all hardcoded redirect URIs
  - Enhanced logging for OAuth flow debugging
  - Better error messages with context

### 4. **New Frontend Callback Endpoint** ✅
- **Created**: `/apps/frontend/src/app/api/auth/callback/google/route.ts`
- **Purpose**: Next.js API route that receives Google's OAuth callback
- **Flow**:
  1. Google redirects to `/api/auth/callback/google?code=xxx&state=xxx`
  2. Frontend API route calls backend `/v1/integrations/gsc/callback`
  3. Backend exchanges code for tokens
  4. Redirects user to Settings page with success/error message

### 5. **Updated Backend Callback** ✅
- **Modified**: `/apps/backend/src/modules/integrations/integrations.controller.ts`
- **Changes**:
  - Made callback endpoint **public** (no JWT required)
  - Extracts `userId` from `state` parameter for security
  - Enhanced logging for OAuth debugging

### 6. **Environment Variables** ✅
- **Updated**: `/apps/backend/.env`
- **Removed**: `GOOGLE_REDIRECT_URI` (now auto-constructed)
- **Required**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `FRONTEND_URL` (used to construct redirect URI)

### 7. **Settings Page OAuth Handling** ✅
- **Updated**: `/apps/frontend/src/app/dashboard/settings/page.tsx`
- **Added**: OAuth success/error message handling from URL parameters
- **Wrapped**: Component in `Suspense` for `useSearchParams`

## Current OAuth Flow

```
1. User clicks "Connect" in Settings
   ↓
2. Frontend calls GET /v1/integrations/gsc/connect
   ↓
3. Backend generates OAuth URL with redirect_uri:
   http://localhost:3000/api/auth/callback/google
   ↓
4. User redirected to Google consent screen
   ↓
5. User grants permissions
   ↓
6. Google redirects to:
   http://localhost:3000/api/auth/callback/google?code=xxx&state=userId
   ↓
7. Frontend API route calls POST /v1/integrations/gsc/callback
   ↓
8. Backend exchanges code for tokens, stores connection
   ↓
9. Frontend redirects to /dashboard/settings?oauth_success=1
   ↓
10. Settings page shows success message
```

## Required Google Cloud Console Configuration

### Step 1: Add Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project: **riviso**
3. Click on your OAuth 2.0 Client ID (e.g., `your-client-id.apps.googleusercontent.com`)
4. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
5. Add this **EXACT** URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click **"SAVE"**

### Step 2: Verify Configuration

Your Google Cloud Console should show:

**Authorized redirect URIs:**
- ✅ `http://localhost:3000/api/auth/callback/google`

**Important**: 
- No trailing slash
- Use `http://` (not `https://`) for localhost
- Exact path: `/api/auth/callback/google`

## Environment Variables

### Backend (`apps/backend/.env`)

```env
# Required
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000

# Optional (for production)
# ENCRYPTION_KEY=your-encryption-key-here
```

**Note**: `GOOGLE_REDIRECT_URI` is no longer needed - it's automatically constructed as:
`${FRONTEND_URL}/api/auth/callback/google`

## OAuth Scopes

### Google Search Console
- **Scope**: `https://www.googleapis.com/auth/webmasters.readonly`
- **Access**: Read-only access to Search Console data
- **Purpose**: Fetch search analytics, queries, pages, clicks, impressions

### Future Integrations
- **Google Analytics**: `https://www.googleapis.com/auth/analytics.readonly`
- **Google Ads**: `https://www.googleapis.com/auth/adwords`

## Security Features

1. **State Parameter**: Contains `userId` for callback verification
2. **Public Callback**: No JWT required (Google redirects here)
3. **State Validation**: Backend validates `state` matches expected `userId`
4. **Defensive Logging**: All OAuth steps are logged for debugging
5. **Error Handling**: Comprehensive error messages for troubleshooting

## Production Readiness Checklist

### ✅ Code Changes
- [x] Centralized OAuth configuration
- [x] No hardcoded URLs
- [x] Environment variable-based redirect URI
- [x] Enhanced logging
- [x] Error handling
- [x] Scope validation

### ⚠️ Google Cloud Console
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google` (for local dev)
- [ ] Add redirect URI: `https://your-domain.com/api/auth/callback/google` (for production)
- [ ] Verify OAuth consent screen is configured
- [ ] Verify scopes are approved

### ⚠️ Environment Variables (Production)
- [ ] Set `FRONTEND_URL=https://your-domain.com`
- [ ] Set `GOOGLE_CLIENT_ID` (production client ID)
- [ ] Set `GOOGLE_CLIENT_SECRET` (production secret)
- [ ] Set `ENCRYPTION_KEY` (for token encryption)

### ⚠️ Testing
- [ ] Test OAuth flow in local development
- [ ] Verify redirect URI matches exactly in Google Cloud Console
- [ ] Test token exchange and storage
- [ ] Test error scenarios (denied access, invalid code, etc.)

## Debugging

### Check Backend Logs

When you click "Connect", you should see:
```
[OAuth] Generated GSC authorization URL for user: <userId>
[OAuth] Redirect URI: http://localhost:3000/api/auth/callback/google
[OAuth] Scopes: https://www.googleapis.com/auth/webmasters.readonly
[OAuth] IMPORTANT: Ensure this redirect URI is added in Google Cloud Console
```

### Check Frontend Logs

In browser console, you should see:
```
[OAuth Callback] Processing OAuth callback
[OAuth Callback] Successfully connected GSC
```

### Common Issues

1. **redirect_uri_mismatch**
   - **Cause**: URI in Google Cloud Console doesn't match exactly
   - **Fix**: Copy the exact URI from backend logs and add to Google Cloud Console

2. **Token exchange failed**
   - **Cause**: Invalid client secret or code already used
   - **Fix**: Verify `GOOGLE_CLIENT_SECRET` is correct

3. **No GSC properties found**
   - **Cause**: Google account has no verified Search Console properties
   - **Fix**: Verify the Google account has at least one verified property

## Files Modified

### Backend
- ✅ `/apps/backend/src/common/config/oauth.config.ts` (NEW)
- ✅ `/apps/backend/src/modules/integrations/services/gsc.service.ts`
- ✅ `/apps/backend/src/modules/integrations/integrations.controller.ts`
- ✅ `/apps/backend/src/modules/integrations/integrations.module.ts`
- ✅ `/apps/backend/.env`

### Frontend
- ✅ `/apps/frontend/src/app/api/auth/callback/google/route.ts` (NEW)
- ✅ `/apps/frontend/src/app/dashboard/settings/page.tsx`

## Next Steps

1. **Add redirect URI to Google Cloud Console** (see above)
2. **Restart backend** to load new OAuth configuration
3. **Test the connection** from Settings page
4. **Verify** the OAuth flow completes successfully

The system is now ready for OAuth testing once the redirect URI is added to Google Cloud Console.
