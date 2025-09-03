# Vercel Deployment Setup for Monorepo

## Current Issue
The build is successful but Vercel can't find the routes manifest file due to path duplication:
```
Error: The file "/vercel/path0/apps/web/apps/web/.next/routes-manifest.json" couldn't be found.
```

This happens because the Root Directory is not set correctly in Vercel project settings.

## Solution

### 1. Set Root Directory in Vercel Dashboard (CRITICAL)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. In the **Root Directory** section, set it to: `apps/web`
4. Save the changes

**This is the most important step!** Without this, Vercel will look for files in the wrong location.

### 2. Current vercel.json Configuration
The `vercel.json` file is configured to use pnpm workspace filtering:

```json
{
  "buildCommand": "pnpm --filter @riviso/web run build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs"
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
