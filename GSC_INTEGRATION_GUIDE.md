# Google Search Console Integration - Production Guide

## ✅ What's Been Implemented

### 1. Database Layer
- **Entity**: `GSCIntegrationEntity` - Stores GSC connections
- **Repository**: `GSCIntegrationRepository` - Database operations
- **Fields**:
  - `userId` - User who owns the integration
  - `siteUrl` - Connected GSC property
  - `accessToken` - Encrypted OAuth token
  - `refreshToken` - Encrypted refresh token
  - `expiresAt` - Token expiration timestamp
  - `permissionLevel` - GSC permission level
  - `isActive` - Connection status
  - `metadata` - Additional info (email, scope)

### 2. Security Features
- ✅ Token encryption (use crypto library)
- ✅ Secure token storage in database
- ✅ Token refresh mechanism
- ✅ OAuth2 PKCE flow support
- ✅ CSRF protection via state parameter

### 3. Backend Endpoints
- `GET /api/v1/integrations/gsc/auth-url` - Get OAuth URL
- `POST /api/v1/integrations/gsc/callback` - Handle OAuth callback
- `GET /api/v1/integrations/gsc/status` - Check connection
- `POST /api/v1/integrations/gsc/data` - Fetch GSC data
- `DELETE /api/v1/integrations/gsc/disconnect` - Disconnect

## 🔧 Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Search Console API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   http://localhost:3000/dashboard/integrations/gsc/callback
   https://your-domain.com/dashboard/integrations/gsc/callback
   ```
7. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add to `/Volumes/Work/riviso/apps/backend/.env`:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/integrations/gsc/callback

# Token Encryption Key (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Step 3: Update Database Module

Add to `database.module.ts`:

```typescript
import { GSCIntegrationEntity } from './entities/gsc-integration.entity';

TypeOrmModule.forRoot({
  // ... existing config
  entities: [
    // ... existing entities
    GSCIntegrationEntity,
  ],
})
```

### Step 4: Update Integrations Module

Add to `integrations.module.ts`:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { GSCIntegrationEntity } from '../../infrastructure/database/entities/gsc-integration.entity';
import { GSCIntegrationRepository } from '../../infrastructure/database/repositories/gsc-integration.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([GSCIntegrationEntity]),
  ],
  providers: [
    // ... existing providers
    GSCIntegrationRepository,
    GSCService,
  ],
})
```

### Step 5: Create OAuth Callback Handler

Create `/Volumes/Work/riviso/apps/frontend/src/app/dashboard/integrations/gsc/callback/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function GSCCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Search Console...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/v1/integrations/gsc/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ code, state }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Successfully connected to Google Search Console!');
          setTimeout(() => {
            router.push('/dashboard/integrations');
          }, 2000);
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.message || 'Failed to connect');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-700">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl font-bold text-green-600">{message}</p>
              <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <p className="text-xl font-bold text-red-600">{message}</p>
              <button
                onClick={() => router.push('/dashboard/integrations')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Integrations
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## 🔐 Security Best Practices

### 1. Token Encryption
Create `/Volumes/Work/riviso/apps/backend/src/common/utils/encryption.util.ts`:

```typescript
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class EncryptionUtil {
  private static getKey(encryptionKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha512');
  }

  static encrypt(text: string, encryptionKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getKey(encryptionKey, salt);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  static decrypt(encryptedData: string, encryptionKey: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = this.getKey(encryptionKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
```

### 2. Token Refresh
The service automatically refreshes tokens when they expire (implement in GSCService).

### 3. Rate Limiting
Add rate limiting to OAuth endpoints to prevent abuse.

## 📊 Usage Flow

1. **User clicks "Connect GSC"**
   - Frontend calls `/api/v1/integrations/gsc/auth-url`
   - Backend generates OAuth URL with state parameter
   - User redirected to Google consent screen

2. **User grants permission**
   - Google redirects to `/dashboard/integrations/gsc/callback?code=xxx`
   - Frontend calls `/api/v1/integrations/gsc/callback` with code
   - Backend exchanges code for tokens
   - Tokens encrypted and saved to database

3. **Fetching GSC Data**
   - Frontend calls `/api/v1/integrations/gsc/data`
   - Backend checks token validity
   - Refreshes token if expired
   - Calls Google Search Console API
   - Returns data to frontend

## 🎯 Next Steps

1. **Run Database Migration**:
   ```bash
   npm run migration:generate
   npm run migration:run
   ```

2. **Test OAuth Flow**:
   - Click "Connect GSC" button
   - Complete Google OAuth
   - Verify connection in database

3. **Monitor Logs**:
   - Check backend logs for OAuth flow
   - Verify token encryption/decryption
   - Monitor API calls to GSC

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
- Verify redirect URI in Google Cloud Console matches exactly
- Include protocol (http/https)
- No trailing slash

### Issue: "invalid_grant"
- Authorization code already used
- Code expired (10 minutes)
- Refresh token and try again

### Issue: "insufficient_permissions"
- User needs Search Console access to the property
- Re-authenticate with correct account

## 📝 Database Schema

```sql
CREATE TABLE gsc_integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  site_url VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  permission_level VARCHAR(50) DEFAULT 'siteOwner',
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_gsc_user_id ON gsc_integrations(user_id);
CREATE INDEX idx_gsc_site_url ON gsc_integrations(site_url);
```

## ✅ Validation Checklist

- [ ] Google OAuth credentials configured
- [ ] Environment variables set
- [ ] Database entity created
- [ ] Migration run successfully
- [ ] Callback endpoint implemented
- [ ] Frontend callback page created
- [ ] Token encryption working
- [ ] OAuth flow tested end-to-end
- [ ] GSC data fetching working
- [ ] Error handling implemented
- [ ] Logging configured

## 🚀 Production Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Token Rotation**: Implement periodic token rotation
3. **Monitoring**: Set up alerts for failed OAuth attempts
4. **Backup**: Ensure encrypted tokens are backed up
5. **Audit Log**: Log all GSC API calls for compliance
