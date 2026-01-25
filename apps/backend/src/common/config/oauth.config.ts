import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Centralized OAuth 2.0 configuration for Google services.
 * Single source of truth for OAuth settings across the application.
 */
@Injectable()
export class OAuthConfig {
  private readonly logger = new Logger(OAuthConfig.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get Google OAuth Client ID
   * @throws BadRequestException if not configured
   */
  getClientId(): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured in environment variables');
      throw new Error('Google OAuth Client ID is not configured. Set GOOGLE_CLIENT_ID in environment variables.');
    }
    return clientId;
  }

  /**
   * Get Google OAuth Client Secret
   * @throws BadRequestException if not configured
   */
  getClientSecret(): string {
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientSecret) {
      this.logger.error('GOOGLE_CLIENT_SECRET is not configured in environment variables');
      throw new Error('Google OAuth Client Secret is not configured. Set GOOGLE_CLIENT_SECRET in environment variables.');
    }
    return clientSecret;
  }

  /**
   * Get the OAuth redirect URI.
   * Constructs from FRONTEND_URL + standardized callback path.
   * No hardcoded URLs - all from environment variables.
   */
  getRedirectUri(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const baseUrl = frontendUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // Standardized callback path
    const callbackPath = '/api/auth/callback/google';
    const redirectUri = `${baseUrl}${callbackPath}`;

    this.logger.log(`OAuth Redirect URI: ${redirectUri}`);
    return redirectUri;
  }

  /**
   * Get frontend base URL
   */
  getFrontendUrl(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return frontendUrl.replace(/\/$/, '');
  }

  /**
   * Validate OAuth configuration
   * @returns true if all required values are present
   */
  validate(): boolean {
    try {
      this.getClientId();
      this.getClientSecret();
      this.getRedirectUri();
      return true;
    } catch (error) {
      this.logger.error('OAuth configuration validation failed', error);
      return false;
    }
  }

  /**
   * Get Google OAuth scopes for Search Console
   */
  getSearchConsoleScopes(): string[] {
    return ['https://www.googleapis.com/auth/webmasters.readonly'];
  }

  /**
   * Get Google OAuth scopes for Analytics
   */
  getAnalyticsScopes(): string[] {
    return ['https://www.googleapis.com/auth/analytics.readonly'];
  }

  /**
   * Get Google OAuth scopes for Ads
   */
  getAdsScopes(): string[] {
    return ['https://www.googleapis.com/auth/adwords'];
  }

  /**
   * Build OAuth authorization URL
   */
  buildAuthUrl(params: {
    scopes: string[];
    state: string;
    accessType?: 'online' | 'offline';
    prompt?: 'none' | 'consent' | 'select_account';
  }): string {
    const clientId = this.getClientId();
    const redirectUri = this.getRedirectUri();
    const scopes = params.scopes.join(' ');

    const urlParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: params.accessType || 'offline',
      prompt: params.prompt || 'consent',
      state: params.state,
      include_granted_scopes: 'true',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`;

    this.logger.log(`Generated OAuth URL with redirect_uri: ${redirectUri}`);
    this.logger.debug(`OAuth scopes: ${scopes}`);
    this.logger.debug(`OAuth state: ${params.state.substring(0, 20)}...`);

    return authUrl;
  }
}
