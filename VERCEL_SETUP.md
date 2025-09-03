# Vercel Deployment Setup for Monorepo

## Current Issue
The `vercel.json` schema validation failed because `rootDirectory` is not a valid property in the configuration file. This needs to be set in the Vercel project settings instead.

## Solution

### 1. Set Root Directory in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. In the **Root Directory** section, set it to: `apps/web`
4. Save the changes

### 2. Current vercel.json Configuration
The `vercel.json` file is now correctly configured without the invalid `rootDirectory` property:

```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

### 3. Alternative: Use Vercel CLI
If you prefer to set this via CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Set the root directory
vercel --prod
# When prompted, set the root directory to: apps/web
```

## Expected Result
After setting the root directory in Vercel project settings, the deployment should work correctly with the current `vercel.json` configuration.

## Troubleshooting
- If you still get directory errors, ensure the `apps/web` directory exists in your repository
- Make sure the `package.json` in `apps/web` has the correct build script
- Verify that all dependencies are properly installed in the monorepo root
