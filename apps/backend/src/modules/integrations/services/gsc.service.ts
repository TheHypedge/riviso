import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  GscDataQueryDto,
  GscPerformanceData,
  GscSite,
  GscDimension,
} from '@riviso/shared-types';
import { OAuthConfig } from '../../../common/config/oauth.config';

export interface GSCConnection {
  userId: string;
  siteUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  connectedAt: string;
}

/**
 * Simplified GSC Service - Works without database (in-memory storage)
 * For production with database, use gsc.service.ts (production version)
 */
@Injectable()
export class GoogleSearchConsoleService {
  private readonly logger = new Logger(GoogleSearchConsoleService.name);
  private readonly GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';
  private readonly OAUTH_BASE = 'https://oauth2.googleapis.com';
  
  // In-memory storage (replace with database in production)
  private connections: Map<string, GSCConnection> = new Map();

  constructor(
    private configService: ConfigService,
    private oauthConfig: OAuthConfig,
  ) {}

  /**
   * Generate OAuth2 authorization URL
   * Uses centralized OAuth configuration - no hardcoded URLs
   */
  async getAuthUrl(userId: string): Promise<{ authUrl: string }> {
    try {
      // Validate OAuth configuration
      if (!this.oauthConfig.validate()) {
        throw new BadRequestException(
          'Google OAuth not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and FRONTEND_URL in environment variables.',
        );
      }

      // Get scopes for Search Console (read-only)
      const scopes = this.oauthConfig.getSearchConsoleScopes();

      // Build authorization URL using centralized config
      const authUrl = this.oauthConfig.buildAuthUrl({
        scopes,
        state: userId, // State contains userId for callback verification
        accessType: 'offline', // Request refresh token
        prompt: 'consent', // Force consent screen to get refresh token
      });

      const redirectUri = this.oauthConfig.getRedirectUri();
      this.logger.log(`[OAuth] Generated GSC authorization URL for user: ${userId}`);
      this.logger.log(`[OAuth] Redirect URI: ${redirectUri}`);
      this.logger.log(`[OAuth] Scopes: ${scopes.join(', ')}`);
      this.logger.warn(`[OAuth] IMPORTANT: Ensure this redirect URI is added in Google Cloud Console: ${redirectUri}`);

      return { authUrl };
    } catch (error) {
      this.logger.error(`[OAuth] Failed to generate authorization URL: ${error.message}`, error.stack);
      throw error instanceof BadRequestException 
        ? error 
        : new BadRequestException('Failed to generate OAuth authorization URL');
    }
  }

  /**
   * Handle OAuth callback
   * Validates state (userId) and exchanges code for tokens
   */
  async handleOAuthCallback(code: string, state: string, userId: string): Promise<GSCConnection> {
    this.logger.log(`[OAuth] Handling callback for user: ${userId}`);
    this.logger.debug(`[OAuth] State parameter: ${state.substring(0, 20)}...`);

    // Validate state matches userId (basic security check)
    if (state !== userId) {
      this.logger.warn(`[OAuth] State mismatch - expected: ${userId}, received: ${state}`);
      throw new BadRequestException('Invalid OAuth state parameter');
    }

    try {
      // Exchange code for tokens
      this.logger.log(`[OAuth] Exchanging authorization code for access token`);
      const tokens = await this.exchangeCodeForToken(code);

      // Fetch user's GSC sites to verify access
      this.logger.log(`[OAuth] Fetching Google Search Console sites`);
      const sites = await this.fetchSitesFromGoogle(tokens.access_token);

      if (!sites || sites.length === 0) {
        this.logger.warn(`[OAuth] No GSC properties found for authenticated account`);
        throw new BadRequestException(
          'No Google Search Console properties found for this account. Please verify your account has access to at least one property.',
        );
      }

      this.logger.log(`[OAuth] Found ${sites.length} GSC property/properties`);

      // Use the first site (in production, you might want property selection)
      const primarySite = sites[0];
      this.logger.log(`[OAuth] Using primary property: ${primarySite.siteUrl}`);

      // Store connection in memory
      const connection: GSCConnection = {
        userId,
        siteUrl: primarySite.siteUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || tokens.access_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        connectedAt: new Date().toISOString(),
      };

      this.connections.set(userId, connection);
      this.logger.log(`[OAuth] GSC connection established for user ${userId}, property: ${primarySite.siteUrl}`);

      return connection;
    } catch (error: any) {
      this.logger.error(`[OAuth] Callback processing failed: ${error.message}`, error.stack);
      
      // Re-throw if already a proper exception
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException(`Failed to authenticate with Google Search Console: ${error.message}`);
    }
  }

  /**
   * Exchange authorization code for tokens
   * Uses centralized OAuth configuration
   */
  private async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const clientId = this.oauthConfig.getClientId();
      const clientSecret = this.oauthConfig.getClientSecret();
      const redirectUri = this.oauthConfig.getRedirectUri();

      this.logger.log(`[OAuth] Exchanging authorization code for tokens`);
      this.logger.debug(`[OAuth] Using redirect URI: ${redirectUri}`);

      const response = await axios.post(
        `${this.OAUTH_BASE}/token`,
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.log(`[OAuth] Token exchange successful`);
      this.logger.debug(`[OAuth] Token expires in: ${response.data.expires_in}s`);
      this.logger.debug(`[OAuth] Refresh token present: ${!!response.data.refresh_token}`);

      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error_description 
        || error?.response?.data?.error 
        || error?.message 
        || 'Unknown error';
      
      this.logger.error(`[OAuth] Token exchange failed: ${errorMessage}`);
      this.logger.debug(`[OAuth] Error response: ${JSON.stringify(error?.response?.data)}`);
      
      if (error?.response?.status === 400) {
        throw new BadRequestException(`Token exchange failed: ${errorMessage}. Verify redirect_uri matches exactly.`);
      }
      throw new UnauthorizedException(`Failed to exchange authorization code: ${errorMessage}`);
    }
  }

  /**
   * Fetch sites from Google API
   */
  private async fetchSitesFromGoogle(accessToken: string): Promise<GscSite[]> {
    try {
      const response = await axios.get(`${this.GSC_API_BASE}/sites`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.siteEntry || [];
    } catch (error) {
      this.logger.error(`Error fetching sites: ${error.message}`);
      throw new BadRequestException('Failed to fetch Google Search Console properties');
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    siteUrl?: string;
    connectedAt?: string;
    lastSyncAt?: string | null;
  }> {
    const connection = this.connections.get(userId);
    return {
      connected: !!connection,
      siteUrl: connection?.siteUrl,
      connectedAt: connection?.connectedAt,
      lastSyncAt: null,
    };
  }

  /**
   * Disconnect GSC
   */
  async disconnect(userId: string): Promise<boolean> {
    this.connections.delete(userId);
    this.logger.log(`GSC disconnected for user: ${userId}`);
    return true;
  }

  /**
   * Get sites for user
   */
  async getSites(userId: string): Promise<GscSite[]> {
    const connection = this.connections.get(userId);
    if (!connection) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    return this.fetchSitesFromGoogle(connection.accessToken);
  }

  /**
   * Get performance data
   */
  async getPerformanceData(userId: string, dto: GscDataQueryDto): Promise<GscPerformanceData> {
    const connection = this.connections.get(userId);
    if (!connection) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    try {
      const response = await axios.post(
        `${this.GSC_API_BASE}/sites/${encodeURIComponent(dto.siteUrl)}/searchAnalytics/query`,
        {
          startDate: dto.startDate,
          endDate: dto.endDate,
          dimensions: dto.dimensions || [GscDimension.DATE, GscDimension.QUERY],
          rowLimit: 25000,
        },
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Process and return data
      return this.processGscData(dto, response.data.rows || []);
    } catch (error) {
      this.logger.error(`Error fetching GSC data: ${error.message}`);
      throw new BadRequestException('Failed to fetch Google Search Console data');
    }
  }

  /**
   * Process GSC API data
   */
  private processGscData(dto: GscDataQueryDto, rows: any[]): GscPerformanceData {
    let totalClicks = 0;
    let totalImpressions = 0;
    const dailyMap = new Map();

    rows.forEach((row: any) => {
      totalClicks += row.clicks || 0;
      totalImpressions += row.impressions || 0;
    });

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      siteUrl: dto.siteUrl,
      totalClicks,
      totalImpressions,
      averageCtr: parseFloat(avgCtr.toFixed(2)),
      averagePosition: 0,
      dailyPerformance: [],
      topQueries: [],
      topPages: [],
      topCountries: [],
      topDevices: [],
      startDate: dto.startDate,
      endDate: dto.endDate,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Export with alias
export { GoogleSearchConsoleService as GSCService };
