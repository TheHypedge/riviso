# Vercel Deployment Instructions

## Current Issue
The deployment is failing because Vercel project settings have the Root Directory set to `apps/web`, which doesn't exist in our repository.

## Solution: Update Vercel Project Settings

### Step 1: Access Project Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `riviso` project
3. Click on **Settings** in the top navigation

### Step 2: Update Root Directory
1. In the left sidebar, click on **General**
2. Scroll down to **Root Directory**
3. Click **Edit**
4. Change from `apps/web` to `apps/frontend`
5. Click **Save**

### Step 3: Update Build Settings (Optional but Recommended)
1. In the left sidebar, click on **General** (if not already there)
2. Scroll to **Build & Development Settings**
3. Verify/Update the following:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 4: Redeploy
1. Go back to the **Deployments** tab
2. Click on the three dots (...) next to the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (optional)
5. Click **Redeploy**

## Alternative: Deploy Using Vercel CLI (if installed)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link the project (in the project root)
vercel link

# Update project settings
vercel project rm apps/web
vercel --cwd apps/frontend

# Deploy
vercel --prod
```

## Project Structure
```
riviso/
├── apps/
│   ├── frontend/     ← Next.js app (deploy this)
│   └── backend/      ← NestJS API
└── packages/
    ├── ai-core/
    ├── shared-types/
    └── ui-components/
```

## Important Notes
- The frontend is in `apps/frontend`, not `apps/web`
- This is a monorepo structure with workspaces
- The backend is separate and doesn't need to be deployed to Vercel
- Environment variables may need to be configured in Vercel dashboard

## After Deployment
Once deployed successfully, you'll need to:
1. Set up environment variables (if any)
2. Configure custom domains (optional)
3. Test the deployed application
