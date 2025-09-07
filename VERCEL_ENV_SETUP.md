# Vercel Environment Variables Setup

To fix the login issues in production, you need to set the following environment variables in your Vercel dashboard:

## Required Environment Variables

1. **JWT_SECRET** - A secure random string for JWT token signing
   - Generate a secure secret: `openssl rand -base64 32`
   - Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

2. **NEXT_PUBLIC_APP_URL** - Your production app URL
   - Example: `https://riviso.vercel.app`

3. **NEXT_PUBLIC_GOOGLE_PAGESPEED_API_KEY** - Google PageSpeed Insights API key
   - Get from: https://developers.google.com/speed/docs/insights/v5/get-started

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (riviso)
3. Go to Settings → Environment Variables
4. Add each variable:
   - Name: `JWT_SECRET`
   - Value: `[your-generated-secret]`
   - Environment: Production, Preview, Development
5. Click "Save"
6. Redeploy your application

## Current Issue

The login is failing because:
1. JWT_SECRET is not set in production, causing token generation issues
2. The production environment uses in-memory database which resets on each deployment
3. User data is not persisted between deployments

## Solution

After setting the environment variables, the login should work properly. The in-memory database now includes the test user account for immediate testing.

## Testing

Once deployed with proper environment variables:
1. Try logging in with `akhilesh@thehypedge.com` / `Admin@2025`
2. Check Vercel function logs for detailed debugging information
3. The system will now properly handle JWT token generation and validation