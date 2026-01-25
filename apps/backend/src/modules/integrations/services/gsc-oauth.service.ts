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
    return (
      this.config.get<string>('GOOGLE_REDIRECT_URI') ??
      'http://localhost:4000/api/v1/integrations/gsc/oauth/callback'
    );
  }

  private getEncryptionKey(): string {
    const k = this.config.get<string>('ENCRYPTION_KEY');
    if (!k) throw new BadRequestException('ENCRYPTION_KEY not set. Generate with: openssl rand -base64 32');
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
      throw new UnauthorizedException('Invalid or expired OAuth state. Please try connecting again.');
    }
    const { userId, websiteUrl } = verified;

    let tokens: TokenResponse;
    try {
      tokens = await this.exchangeCodeForToken(code);
    } catch (e: any) {
      this.logger.warn(`Token exchange failed: ${e?.response?.data?.error_description ?? e?.message}`);
      if (e?.response?.data?.error === 'access_denied') {
        throw new BadRequestException('Google access was denied. Please grant permission and try again.');
      }
      throw new BadRequestException('Failed to exchange authorization code. Please try connecting again.');
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
      throw new BadRequestException('Connected, but failed to fetch GSC properties. Please try again.');
    }

    const verifiedSites = sites.filter((s) => s.permissionLevel && s.siteUrl);
    if (verifiedSites.length === 0) {
      throw new BadRequestException(
        'No verified Google Search Console properties found. Add and verify a property first.',
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
    if (!tokenRow) throw new UnauthorizedException('Google account not linked or tokens missing.');

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
      this.logger.warn(`Token refresh failed for account ${googleAccountId}: ${e?.message}`);
      throw new UnauthorizedException('Google tokens expired and refresh failed. Please reconnect GSC.');
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
