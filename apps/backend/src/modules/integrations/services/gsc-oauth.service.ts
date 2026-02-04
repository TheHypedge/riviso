import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { signGscState, verifyGscState } from '../../../common/utils/gsc-state.util';
import { GoogleAccountRepository } from '../../../infrastructure/database/repositories/google-account.repository';
import { GoogleTokenRepository } from '../../../infrastructure/database/repositories/google-token.repository';
import { GscApiClient } from './gsc-api.client';
import { GscSite } from '@riviso/shared-types';

const OAUTH_BASE = 'https://oauth2.googleapis.com';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

@Injectable()
export class GscOAuthService {
  private readonly logger = new Logger(GscOAuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly googleAccountRepo: GoogleAccountRepository,
    private readonly googleTokenRepo: GoogleTokenRepository,
    private readonly gscApiClient: GscApiClient,
  ) {}

  private getClientId(): string {
    const id = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!id) throw new BadRequestException('Google OAuth not configured. Set GOOGLE_CLIENT_ID.');
    return id;
  }

  private getClientSecret(): string {
    const s = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!s) throw new BadRequestException('Google OAuth not configured. Set GOOGLE_CLIENT_SECRET.');
    return s;
  }

  private getRedirectUri(): string {
    // Check for explicit override first
    const explicitUri = this.config.get<string>('GOOGLE_REDIRECT_URI');
    if (explicitUri) {
      return explicitUri;
    }

    // Construct from FRONTEND_URL - Google redirects to the frontend callback page
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const baseUrl = frontendUrl.replace(/\/$/, ''); // Remove trailing slash
    const redirectUri = `${baseUrl}/dashboard/integrations/gsc/callback`;
    this.logger.log(`GSC OAuth redirect URI: ${redirectUri}`);
    return redirectUri;
  }

  private getEncryptionKey(): string {
    const k = this.config.get<string>('ENCRYPTION_KEY');
    if (!k) {
      // In development, use a derived key from JWT_SECRET as fallback
      const jwtSecret = this.config.get<string>('JWT_SECRET');
      const nodeEnv = this.config.get<string>('NODE_ENV', 'development');

      if (nodeEnv === 'development' && jwtSecret) {
        this.logger.warn('ENCRYPTION_KEY not set. Using derived key in development mode. Set ENCRYPTION_KEY for production.');
        // Create a base64 key from JWT_SECRET (padded to 32 bytes)
        const paddedKey = (jwtSecret + '0'.repeat(32)).slice(0, 32);
        return Buffer.from(paddedKey).toString('base64');
      }

      this.logger.error('ENCRYPTION_KEY environment variable is required. Generate with: openssl rand -base64 32');
      throw new BadRequestException(
        'Server configuration error. Please contact support or check server logs.',
      );
    }
    return k;
  }

  private getStateSecret(): string {
    return this.config.get<string>('GSC_STATE_SECRET') ?? this.config.get<string>('JWT_SECRET') ?? 'gsc-state-secret';
  }

  /**
   * Build OAuth consent URL. Frontend redirects user here.
   */
  getConnectUrl(userId: string, websiteUrl = ''): string {
    const clientId = this.getClientId();
    const redirectUri = this.getRedirectUri();
    const state = signGscState(userId, websiteUrl, this.getStateSecret());
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GSC_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state,
      include_granted_scopes: 'true',
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    this.logger.log(`GSC connect URL generated for user ${userId}`);
    return url;
  }

  /**
   * Exchange authorization code for tokens. Encrypt and store.
   * Fetch sites from GSC and return them (for property matching/selection).
   */
  async handleCallback(code: string, state: string): Promise<{
    userId: string;
    websiteUrl: string;
    email: string;
    sites: GscSite[];
    googleAccountId: string;
  }> {
    const verified = verifyGscState(state, this.getStateSecret());
    if (!verified) {
      this.logger.warn('Invalid or expired GSC OAuth state');
      throw new UnauthorizedException(
        'Your connection request has expired. Please go back to Settings and try connecting again.',
      );
    }
    const { userId, websiteUrl } = verified;

    let tokens: TokenResponse;
    try {
      tokens = await this.exchangeCodeForToken(code);
    } catch (e: any) {
      const errorCode = e?.response?.data?.error;
      const errorDesc = e?.response?.data?.error_description ?? e?.message;
      this.logger.warn(`Token exchange failed: ${errorDesc}`);

      if (errorCode === 'access_denied') {
        throw new BadRequestException(
          'You declined the permission request. Please try again and click "Allow" to grant access to Google Search Console.',
        );
      }
      if (errorCode === 'invalid_grant') {
        throw new BadRequestException(
          'The authorization code has expired or was already used. Please try connecting again.',
        );
      }
      if (errorCode === 'redirect_uri_mismatch') {
        throw new BadRequestException(
          'Configuration error: The redirect URI does not match. Please contact support.',
        );
      }
      throw new BadRequestException(
        'Unable to complete the connection with Google. Please try again. If the problem persists, try clearing your browser cache.',
      );
    }

    const encryptionKey = this.getEncryptionKey();
    const accessEnc = EncryptionUtil.encrypt(tokens.access_token, encryptionKey);
    const refreshEnc = tokens.refresh_token
      ? EncryptionUtil.encrypt(tokens.refresh_token, encryptionKey)
      : accessEnc;

    const expiry = new Date(Date.now() + tokens.expires_in * 1000);

    let email = 'unknown';
    try {
      const userInfo = await this.fetchUserInfo(tokens.access_token);
      email = userInfo.email ?? email;
    } catch {
      /* best-effort */
    }

    const existing = await this.googleAccountRepo.findByUserAndEmail(userId, email);
    const googleAccount = existing ?? await this.googleAccountRepo.create({ userId, email });
    await this.googleTokenRepo.upsert({
      googleAccountId: googleAccount.id,
      accessTokenEncrypted: accessEnc,
      refreshTokenEncrypted: refreshEnc,
      tokenExpiry: expiry,
      scope: tokens.scope ?? GSC_SCOPE,
    });

    let sites: GscSite[] = [];
    try {
      sites = await this.gscApiClient.listSites(tokens.access_token);
    } catch (e: any) {
      this.logger.warn(`listSites after OAuth failed: ${e?.message}`);
      throw new BadRequestException(
        'Successfully authenticated with Google, but we couldn\'t retrieve your Search Console properties. Please ensure you have access to at least one property and try again.',
      );
    }

    const verifiedSites = sites.filter((s) => s.permissionLevel && s.siteUrl);
    if (verifiedSites.length === 0) {
      throw new BadRequestException(
        'No Google Search Console properties found for your account. Please add and verify a website in Google Search Console first, then try connecting again.',
      );
    }

    this.logger.log(`GSC OAuth success: user=${userId} email=${email} sites=${verifiedSites.length}`);
    return {
      userId,
      websiteUrl,
      email,
      sites: verifiedSites,
      googleAccountId: googleAccount.id,
    };
  }

  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const redirectUri = this.getRedirectUri();
    const res = await axios.post<TokenResponse>(
      `${OAUTH_BASE}/token`,
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15_000 },
    );
    return res.data;
  }

  private async fetchUserInfo(accessToken: string): Promise<{ email?: string }> {
    const res = await axios.get<{ email?: string }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5_000,
    });
    return res.data;
  }

  /**
   * Return valid access token for a Google account. Refreshes if expired.
   */
  async getValidAccessToken(googleAccountId: string): Promise<string> {
    const tokenRow = await this.googleTokenRepo.findByGoogleAccountId(googleAccountId);
    if (!tokenRow) {
      throw new UnauthorizedException(
        'Google Search Console is not connected. Please go to Settings > Integrations to connect your account.',
      );
    }

    const encryptionKey = this.getEncryptionKey();
    const now = new Date();
    const bufferMinutes = 5;
    const expired = new Date(tokenRow.tokenExpiry.getTime() - bufferMinutes * 60 * 1000) <= now;

    if (!expired) {
      return EncryptionUtil.decrypt(tokenRow.accessTokenEncrypted, encryptionKey);
    }

    const refreshToken = EncryptionUtil.decrypt(tokenRow.refreshTokenEncrypted, encryptionKey);
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    let res: { data: TokenResponse };
    try {
      res = await axios.post<TokenResponse>(
        `${OAUTH_BASE}/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15_000 },
      );
    } catch (e: any) {
      const errorCode = e?.response?.data?.error;
      this.logger.warn(`Token refresh failed for account ${googleAccountId}: ${e?.message}`);

      if (errorCode === 'invalid_grant') {
        throw new UnauthorizedException(
          'Your Google Search Console connection has expired or been revoked. Please reconnect in Settings > Integrations.',
        );
      }
      throw new UnauthorizedException(
        'Unable to refresh your Google connection. Please try again or reconnect Google Search Console in Settings.',
      );
    }

    const data = res.data;
    const accessEnc = EncryptionUtil.encrypt(data.access_token, encryptionKey);
    const refreshEnc = data.refresh_token
      ? EncryptionUtil.encrypt(data.refresh_token, encryptionKey)
      : tokenRow.refreshTokenEncrypted;
    const expiry = new Date(Date.now() + data.expires_in * 1000);
    await this.googleTokenRepo.upsert({
      googleAccountId,
      accessTokenEncrypted: accessEnc,
      refreshTokenEncrypted: refreshEnc,
      tokenExpiry: expiry,
      scope: data.scope ?? tokenRow.scope ?? undefined,
    });
    return data.access_token;
  }

  /**
   * Disconnect: delete tokens and Google account for user. Revoke not required for read-only.
   */
  async disconnect(userId: string): Promise<void> {
    const accounts = await this.googleAccountRepo.findByUserId(userId);
    for (const acc of accounts) {
      await this.googleTokenRepo.deleteByGoogleAccountId(acc.id);
    }
    await this.googleAccountRepo.deleteByUserId(userId);
    this.logger.log(`GSC disconnected for user ${userId}`);
  }
}
