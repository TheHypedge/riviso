# Vercel Environment Variables Setup

## Critical Environment Variables for Login to Work

The login functionality requires these environment variables to be set in Vercel:

### Required Variables

1. **JWT_SECRET** (Critical for login)
   - Value: `your-super-secret-jwt-key-change-this-in-production`
   - Used for: JWT token generation and verification
   - Without this: Login will fail with "Invalid email or password"

2. **DATABASE_URL** (Optional - SQLite path)
   - Value: `./seo_audit.db`
   - Used for: Database file location
   - Note: In production, database is created in-memory

### How to Set Environment Variables in Vercel

#### Method 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `JWT_SECRET`
   - **Value**: `your-super-secret-jwt-key-change-this-in-production`
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**

#### Method 2: Vercel CLI
```bash
# Set JWT_SECRET
vercel env add JWT_SECRET
# When prompted, enter: your-super-secret-jwt-key-change-this-in-production
# Select: Production, Preview, Development

# Set DATABASE_URL (optional)
vercel env add DATABASE_URL
# When prompted, enter: ./seo_audit.db
# Select: Production, Preview, Development
```

### Verification

After setting environment variables:

1. **Redeploy**: Trigger a new deployment
2. **Check Logs**: Look for "✅ SUPER_ADMIN account created" in build logs
3. **Test Login**: Try logging in with:
   - Email: `iamakhileshsoni@gmail.com`
   - Password: `Admin@2025`

### Database Initialization

The SUPER_ADMIN account is created automatically during build with these credentials:
- **Email**: `iamakhileshsoni@gmail.com`
- **Password**: `Admin@2025`
- **Role**: `super_admin`

### Troubleshooting

#### Login still fails after setting JWT_SECRET:
1. Check Vercel function logs for errors
2. Verify environment variable is actually set
3. Trigger a fresh deployment
4. Check if database initialization succeeded

#### "Invalid email or password" error:
- Most likely cause: Missing JWT_SECRET environment variable
- Check Vercel environment variables are set correctly
- Verify deployment logs show SUPER_ADMIN account creation

#### Database errors:
- SQLite database is created in-memory in Vercel
- Each function execution creates a fresh database
- SUPER_ADMIN account is recreated on each cold start

### Current Status

- ✅ Local development: Working correctly
- ❌ Production deployment: Missing JWT_SECRET environment variable
- 🔧 Fix: Set JWT_SECRET in Vercel environment variables
