# Google Search Console Integration - Implementation Checklist

## ✅ What's Been Created

### 1. Database Layer
- ✅ **Entity**: `/apps/backend/src/infrastructure/database/entities/gsc-integration.entity.ts`
  - Stores encrypted tokens, user mapping, site URL, permissions
- ✅ **Repository**: `/apps/backend/src/infrastructure/database/repositories/gsc-integration.repository.ts`
  - CRUD operations for GSC integrations

### 2. Security & Encryption
- ✅ **Encryption Utility**: `/apps/backend/src/common/utils/encryption.util.ts`
  - AES-256-GCM encryption for OAuth tokens
  - PBKDF2 key derivation
  - Production-ready security

### 3. Backend Service
- ✅ **Production Service**: `/apps/backend/src/modules/integrations/services/gsc.service.production.ts`
  - Real OAuth2 flow with Google
  - Automatic token refresh
  - Encrypted token storage
  - GSC API integration
  - Database persistence

### 4. Frontend Pages
- ✅ **OAuth Callback**: `/apps/frontend/src/app/dashboard/integrations/gsc/callback/page.tsx`
  - Handles OAuth redirect
  - Shows connection status
  - Error handling
- ✅ **Integrations Page**: Updated to use real OAuth flow

### 5. Documentation
- ✅ **Setup Guide**: `/GSC_INTEGRATION_GUIDE.md`
- ✅ **Checklist**: This file

## 🔧 Required Setup Steps

### Step 1: Google Cloud Console Setup (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Search Console API**:
   - In the left menu → **APIs & Services** → **Library**
   - Search for "Google Search Console API"
   - Click **Enable**

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Riviso GSC Integration`
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/dashboard/integrations/gsc/callback
     ```
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

### Step 2: Environment Configuration

Add to `/apps/backend/.env`:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/integrations/gsc/callback

# Token Encryption Key (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=generate-a-secure-32-character-key-here
```

**Generate encryption key (run in terminal)**:
```bash
openssl rand -base64 32
```

### Step 3: Update Database Module

Edit `/apps/backend/src/infrastructure/database/database.module.ts`:

```typescript
import { GSCIntegrationEntity } from './entities/gsc-integration.entity';

TypeOrmModule.forRoot({
  // ... existing config
  entities: [
    // ... existing entities
    UserEntity,
    WorkspaceEntity,
    PageEntity,
    KeywordEntity,
    KeywordRankingEntity,
    CompetitorEntity,
    SeoAuditEntity,
    CroInsightEntity,
    GSCIntegrationEntity, // <-- ADD THIS
  ],
  synchronize: true, // Will auto-create table
})
```

### Step 4: Update Integrations Module

Edit `/apps/backend/src/modules/integrations/integrations.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleSearchConsoleService } from './services/gsc.service.production'; // <-- USE PRODUCTION
import { GSCIntegrationEntity } from '../../infrastructure/database/entities/gsc-integration.entity';
import { GSCIntegrationRepository } from '../../infrastructure/database/repositories/gsc-integration.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([GSCIntegrationEntity]), // <-- ADD THIS
  ],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    GoogleSearchConsoleService, // <-- USE PRODUCTION SERVICE
    GSCIntegrationRepository, // <-- ADD REPOSITORY
  ],
  exports: [IntegrationsService, GoogleSearchConsoleService],
})
export class IntegrationsModule {}
```

### Step 5: Update Integrations Controller

Edit `/apps/backend/src/modules/integrations/integrations.controller.ts`:

Replace the GSC service import:
```typescript
// OLD:
import { GSCService } from './services/gsc.service';

// NEW:
import { GoogleSearchConsoleService } from './services/gsc.service.production';
```

Update constructor:
```typescript
constructor(
  private readonly integrationsService: IntegrationsService,
  private readonly googleSearchConsoleService: GoogleSearchConsoleService, // <-- RENAMED
) {}
```

Update endpoints (already done in existing controller):
```typescript
@Get('gsc/auth-url')
async getGSCAuthUrl(@Request() req: any) {
  return this.googleSearchConsoleService.getAuthUrl(req.user.id);
}

@Post('gsc/callback')
@ApiOperation({ summary: 'Handle OAuth callback' })
async handleGSCCallback(@Body() dto: { code: string; state: string }, @Request() req: any) {
  return this.googleSearchConsoleService.handleOAuthCallback(dto.code, dto.state, req.user.id);
}

// ... other endpoints
```

### Step 6: Update Entity Export

Add to `/apps/backend/src/infrastructure/database/entities/index.ts`:

```typescript
export { GSCIntegrationEntity } from './gsc-integration.entity';
```

### Step 7: Update Shared Types (if needed)

Ensure `/packages/shared-types/src/index.ts` exports GSC types:

```typescript
export * from './gsc'; // or wherever GSC types are defined
```

## 🚀 Testing the Integration

### 1. Start Backend
```bash
cd apps/backend
npm run start:dev
```

### 2. Start Frontend
```bash
cd apps/frontend
npm run dev
```

### 3. Test OAuth Flow

1. Navigate to `http://localhost:3000/dashboard/integrations`
2. Click **"Connect GSC"** button
3. You'll be redirected to Google sign-in
4. Select your Google account (must have GSC access)
5. Grant permissions
6. You'll be redirected back to `/dashboard/integrations/gsc/callback`
7. Should see success message and redirect to integrations page
8. GSC should show as connected

### 4. Check Database

```sql
-- Connect to PostgreSQL
psql -U your_user -d your_database

-- Check if integration was saved
SELECT * FROM gsc_integrations;

-- You should see:
-- - user_id
-- - site_url
-- - encrypted access_token
-- - encrypted refresh_token
-- - expires_at
-- - is_active = true
```

### 5. Test Data Fetching

From integrations page, if connected, try fetching GSC data:
- Should automatically use encrypted tokens
- Should auto-refresh if expired
- Should display real GSC metrics

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: 
- Verify redirect URI in Google Cloud Console exactly matches
- Must be: `http://localhost:3000/dashboard/integrations/gsc/callback`
- No trailing slash
- Exact protocol (http vs https)

### Error: "ENCRYPTION_KEY not configured"
**Solution**:
```bash
# Generate key
openssl rand -base64 32

# Add to .env
ENCRYPTION_KEY=<generated-key>
```

### Error: "Google OAuth credentials not configured"
**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Restart backend after adding

### Error: "No Google Search Console properties found"
**Solution**:
- User must have at least one property added in GSC
- Go to [search.google.com/search-console](https://search.google.com/search-console)
- Add a property first
- Then retry connection

### Error: "Entity GSCIntegrationEntity not found"
**Solution**:
- Ensure entity is imported in `database.module.ts`
- Restart backend to sync database

### Token not refreshing
**Solution**:
- Check `expires_at` field in database
- Verify `refresh_token` is encrypted and saved
- Check backend logs for refresh attempts

## 📊 Database Schema

The `gsc_integrations` table stores:

```sql
CREATE TABLE gsc_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  site_url VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,          -- Encrypted
  refresh_token TEXT NOT NULL,         -- Encrypted
  expires_at BIGINT NOT NULL,          -- Unix timestamp
  permission_level VARCHAR(50) DEFAULT 'siteOwner',
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,                       -- Additional data
  
  INDEX idx_gsc_user_id (user_id),
  INDEX idx_gsc_site_url (site_url)
);
```

## 🔐 Security Features

- ✅ **Token Encryption**: AES-256-GCM
- ✅ **Key Derivation**: PBKDF2 with 100,000 iterations
- ✅ **Auto Token Refresh**: Tokens refreshed before expiry
- ✅ **Secure Storage**: Never store plain text tokens
- ✅ **CSRF Protection**: State parameter validation
- ✅ **Scope Limiting**: Only read-only GSC access

## 📈 Next Steps (Optional Enhancements)

1. **Multiple Sites Support**:
   - Allow users to connect multiple GSC properties
   - Switch between properties in UI

2. **Webhooks**:
   - Set up GSC webhooks for real-time updates
   - Auto-sync on property changes

3. **Data Caching**:
   - Cache GSC API responses in Redis
   - Reduce API calls and improve performance

4. **Analytics Dashboard**:
   - Create visualizations for GSC data
   - Compare periods, export reports

5. **Alert System**:
   - Alert on significant traffic drops
   - Notify on indexing issues

## ✅ Final Checklist

Before testing:
- [ ] Google Cloud project created
- [ ] Search Console API enabled
- [ ] OAuth credentials created
- [ ] Environment variables set
- [ ] Encryption key generated
- [ ] Database entity added to module
- [ ] Repository provided in module
- [ ] Production service imported
- [ ] Controller updated
- [ ] Backend restarted
- [ ] Frontend OAuth callback page created
- [ ] Test with real Google account

## 🎉 Success Criteria

Your GSC integration is working when:
1. ✅ User clicks "Connect GSC" → redirected to Google
2. ✅ User authorizes → redirected to callback page
3. ✅ Callback page shows success
4. ✅ Database contains encrypted tokens
5. ✅ GSC status shows "Connected" in UI
6. ✅ Can fetch real GSC data
7. ✅ Tokens auto-refresh when expired
8. ✅ Can disconnect and reconnect

## 📞 Support

If you encounter issues:
1. Check backend logs for detailed errors
2. Verify all environment variables
3. Test OAuth flow in incognito mode
4. Check database for integration record
5. Verify Google Cloud Console setup

## 🔗 Useful Links

- [Google Search Console API Docs](https://developers.google.com/webmaster-tools)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Search Console Properties](https://search.google.com/search-console)
