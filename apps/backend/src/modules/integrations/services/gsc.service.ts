import { Injectable, Logger, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import {
  GscDataQueryDto,
  GscPerformanceData,
  GscSite,
  GscDimension,
} from '@riviso/shared-types';
import { OAuthConfig } from '../../../common/config/oauth.config';
import { GscConnectionStore } from './gsc-connection.store';

export interface GSCConnection {
  userId: string;
  email?: string;  // Store email for fallback lookup
  siteUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  connectedAt: string;
}

/**
 * GSC Service with persistent file-based storage
 * Connections persist across server restarts
 */
@Injectable()
export class GoogleSearchConsoleService implements OnModuleInit {
  private readonly logger = new Logger(GoogleSearchConsoleService.name);
  private readonly GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';
  private readonly OAUTH_BASE = 'https://oauth2.googleapis.com';
  
  // Persistent storage - loaded from file on startup
  private connections: Map<string, GSCConnection> = new Map();

  constructor(
    private configService: ConfigService,
    private oauthConfig: OAuthConfig,
    private connectionStore: GscConnectionStore,
  ) {}

  /**
   * Load connections from file on module initialization
   */
  async onModuleInit() {
    this.logger.log('Loading GSC connections from persistent storage...');
    this.connections = this.connectionStore.loadConnections();
    this.logger.log(`Loaded ${this.connections.size} GSC connection(s) on startup`);

    // Proactively refresh expired tokens on startup
    if (this.connections.size > 0) {
      this.logger.log('Checking for expired tokens and refreshing...');
      await this.refreshExpiredTokensOnStartup();
    }
  }

  /**
   * Refresh all expired tokens on startup
   */
  private async refreshExpiredTokensOnStartup(): Promise<void> {
    const now = Date.now();
    const userIds = Array.from(this.connections.keys());

    for (const userId of userIds) {
      const connection = this.connections.get(userId);
      if (!connection) continue;

      // If token is expired or expires within 5 minutes
      if (now >= connection.expiresAt - 300000) {
        this.logger.log(`[Startup] Token expired for user ${userId}, refreshing...`);
        try {
          await this.refreshTokenIfNeeded(userId);
        } catch (error: any) {
          this.logger.warn(`[Startup] Failed to refresh token for user ${userId}: ${error.message}`);
          // Continue with other users even if one fails
        }
      } else {
        const minutesUntilExpiry = Math.floor((connection.expiresAt - now) / 1000 / 60);
        this.logger.log(`[Startup] Token valid for user ${userId} (${minutesUntilExpiry} minutes until expiry)`);
      }
    }
  }

  /**
   * Proactively refresh tokens every hour
   * Refreshes tokens that will expire within 15 minutes
   */
  @Cron(CronExpression.EVERY_HOUR)
  async proactiveTokenRefresh(): Promise<void> {
    if (this.connections.size === 0) {
      return; // No connections to refresh
    }

    this.logger.log(`[Cron] Running proactive token refresh for ${this.connections.size} connection(s)`);
    const now = Date.now();
    const userIds = Array.from(this.connections.keys());

    for (const userId of userIds) {
      const connection = this.connections.get(userId);
      if (!connection) continue;

      // Refresh if token expires within 15 minutes
      if (now >= connection.expiresAt - 900000) {
        this.logger.log(`[Cron] Token expiring soon for user ${userId}, refreshing proactively...`);
        try {
          await this.refreshTokenIfNeeded(userId);
          this.logger.log(`[Cron] Successfully refreshed token for user ${userId}`);
        } catch (error: any) {
          this.logger.warn(`[Cron] Failed to refresh token for user ${userId}: ${error.message}`);
          // Continue with other users
        }
      } else {
        const minutesUntilExpiry = Math.floor((connection.expiresAt - now) / 1000 / 60);
        this.logger.debug(`[Cron] Token still valid for user ${userId} (${minutesUntilExpiry} minutes remaining)`);
      }
    }
  }

  /**
   * Save connections to file
   */
  private saveConnections(): void {
    this.connectionStore.saveConnections(this.connections);
  }

  /**
   * Find connection by userId, with email fallback
   * This handles cases where userId changes but email remains the same
   */
  private findConnection(userId: string, email?: string): GSCConnection | undefined {
    // First try direct userId lookup
    let connection = this.connections.get(userId);
    if (connection) {
      return connection;
    }

    // Fallback: search by email if provided
    if (email) {
      const emailLower = email.toLowerCase();
      for (const conn of this.connections.values()) {
        if (conn.email?.toLowerCase() === emailLower) {
          this.logger.log(`[Connection] Found connection by email fallback for: ${email} (stored userId: ${conn.userId}, requested: ${userId})`);
          // Migrate the connection to the new userId
          this.connections.delete(conn.userId);
          conn.userId = userId;
          this.connections.set(userId, conn);
          this.saveConnections();
          this.logger.log(`[Connection] Migrated connection from old userId to: ${userId}`);
          return conn;
        }
      }
    }

    return undefined;
  }

  /**
   * Set user email for connection lookup (called from controller)
   */
  setUserEmail(userId: string, email: string): void {
    const connection = this.connections.get(userId);
    if (connection && !connection.email) {
      connection.email = email.toLowerCase();
      this.saveConnections();
      this.logger.log(`[Connection] Added email to existing connection for user ${userId}`);
    }
  }

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
  async handleOAuthCallback(code: string, state: string, userId: string, email?: string): Promise<GSCConnection> {
    this.logger.log(`[OAuth] Handling callback for user: ${userId}, email: ${email || 'not provided'}`);
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

      // Store connection in memory (with email for cross-account lookup)
      const connection: GSCConnection = {
        userId,
        email: email?.toLowerCase(),
        siteUrl: primarySite.siteUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || tokens.access_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        connectedAt: new Date().toISOString(),
      };

      this.connections.set(userId, connection);
      this.saveConnections(); // Persist to file
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
   * Get connection status (with email fallback for cross-account lookup)
   */
  async getConnectionStatus(userId: string, email?: string): Promise<{
    connected: boolean;
    siteUrl?: string;
    connectedAt?: string;
    lastSyncAt?: string | null;
  }> {
    const connection = this.findConnection(userId, email);
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
    this.saveConnections(); // Persist the disconnection
    this.logger.log(`GSC disconnected for user: ${userId}`);
    return true;
  }

  /**
   * Get sites for user (with email fallback)
   */
  async getSites(userId: string, email?: string): Promise<GscSite[]> {
    const connection = this.findConnection(userId, email);
    if (!connection) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    // Refresh token if needed
    await this.refreshTokenIfNeeded(userId);

    return this.fetchSitesFromGoogle(connection.accessToken);
  }

  /**
   * Get performance data (with email fallback)
   */
  async getPerformanceData(userId: string, dto: GscDataQueryDto, email?: string): Promise<GscPerformanceData> {
    const connection = this.findConnection(userId, email);
    if (!connection) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    // Refresh token if needed
    await this.refreshTokenIfNeeded(userId);

    try {
      // Properly encode the site URL for the API endpoint
      const encodedSiteUrl = encodeURIComponent(dto.siteUrl);
      
      this.logger.log(`[GSC] Fetching data for property: ${dto.siteUrl}`);
      this.logger.log(`[GSC] Date range: ${dto.startDate} to ${dto.endDate}`);
      
      const apiUrl = `${this.GSC_API_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`;
      
      // For accurate totals matching Google Search Console UI, we need to:
      // 1. Get daily totals (DATE dimension only) - this gives us accurate daily aggregation
      // 2. Get query breakdown (DATE + QUERY) - for top queries
      // 3. Get page breakdown (DATE + PAGE) - for top pages
      
      // First, get daily totals (most accurate for overall metrics)
      const dailyRequest = {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.DATE],
        rowLimit: 1000,
      };
      
      this.logger.log(`[GSC] Requesting daily totals with dimensions: DATE only`);
      
      const dailyResponse = await axios.post(
        apiUrl,
        dailyRequest,
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      const dailyRows = dailyResponse.data?.rows || [];
      this.logger.log(`[GSC] Daily totals: ${dailyRows.length} rows`);
      
      // Get query breakdown if requested
      let queryRows: any[] = [];
      if (dto.dimensions?.includes(GscDimension.QUERY) || !dto.dimensions) {
        const queryRequest = {
          startDate: dto.startDate,
          endDate: dto.endDate,
          dimensions: [GscDimension.DATE, GscDimension.QUERY],
          rowLimit: 10000,
        };
        
        this.logger.log(`[GSC] Requesting query breakdown`);
        const queryResponse = await axios.post(apiUrl, queryRequest, {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        queryRows = queryResponse.data?.rows || [];
        this.logger.log(`[GSC] Query breakdown: ${queryRows.length} rows`);
      }
      
      // Get page breakdown if requested
      let pageRows: any[] = [];
      if (dto.dimensions?.includes(GscDimension.PAGE)) {
        const pageRequest = {
          startDate: dto.startDate,
          endDate: dto.endDate,
          dimensions: [GscDimension.DATE, GscDimension.PAGE],
          rowLimit: 10000,
        };
        
        this.logger.log(`[GSC] Requesting page breakdown`);
        const pageResponse = await axios.post(apiUrl, pageRequest, {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        pageRows = pageResponse.data?.rows || [];
        this.logger.log(`[GSC] Page breakdown: ${pageRows.length} rows`);
      }
      
      // Process data using daily rows for accurate totals, and query/page rows for breakdowns
      const processedData = this.processGscDataMulti(dto, dailyRows, queryRows, pageRows);
      this.logger.log(`[GSC] Processed data: ${processedData.totalClicks} clicks, ${processedData.totalImpressions} impressions`);
      return processedData;
    } catch (error: any) {
      this.logger.error(`[GSC] Error fetching data: ${error.message}`);
      this.logger.error(`[GSC] Error response:`, error.response?.data);
      this.logger.error(`[GSC] Error status:`, error.response?.status);
      this.logger.error(`[GSC] Error stack:`, error.stack);
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        throw new BadRequestException('Access denied. Please check your Google Search Console permissions.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`Invalid request: ${errorMsg}`);
      } else if (error.response?.status === 401) {
        throw new UnauthorizedException('Authentication failed. Please reconnect Google Search Console.');
      }
      
      throw new BadRequestException(`Failed to fetch Google Search Console data: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Refresh access token if expired
   */
  private async refreshTokenIfNeeded(userId: string): Promise<void> {
    const connection = this.connections.get(userId);
    if (!connection) return;

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() < connection.expiresAt - 300000) {
      this.logger.debug(`[Token] Access token still valid for user ${userId} (expires in ${Math.floor((connection.expiresAt - Date.now()) / 1000 / 60)} minutes)`);
      return; // Token is still valid
    }

    this.logger.log(`[Token] Access token expired or expiring soon for user ${userId}, refreshing...`);
    this.logger.debug(`[Token] Expired at: ${new Date(connection.expiresAt).toISOString()}, Current time: ${new Date().toISOString()}`);

    try {
      const response = await axios.post(
        `${this.OAUTH_BASE}/token`,
        {
          client_id: this.oauthConfig.getClientId(),
          client_secret: this.oauthConfig.getClientSecret(),
          refresh_token: connection.refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // Update connection with new token
      connection.accessToken = response.data.access_token;
      connection.expiresAt = Date.now() + (response.data.expires_in * 1000);
      if (response.data.refresh_token) {
        connection.refreshToken = response.data.refresh_token;
        this.logger.log(`[Token] New refresh token received for user ${userId}`);
      }

      this.connections.set(userId, connection);
      this.saveConnections(); // Persist token refresh immediately
      this.logger.log(`[Token] Access token refreshed successfully for user ${userId}, new expiry: ${new Date(connection.expiresAt).toISOString()}`);
    } catch (error: any) {
      const errorDetail = error?.response?.data?.error_description || error?.response?.data?.error || error?.message;
      this.logger.error(`[Token] Failed to refresh token for user ${userId}: ${errorDetail}`);
      this.logger.error(`[Token] Error response:`, error?.response?.data);

      // Check if it's a permanent error (invalid refresh token)
      if (error?.response?.data?.error === 'invalid_grant') {
        this.logger.warn(`[Token] Refresh token is invalid or revoked for user ${userId}. User needs to re-authenticate.`);
        // Don't delete the connection - let the user manually reconnect
        throw new UnauthorizedException('Your Google Search Console connection has expired. Please reconnect to continue using this feature.');
      }

      // For temporary errors (network issues, etc.), keep the connection and retry later
      this.logger.warn(`[Token] Temporary error refreshing token for user ${userId}. Will retry on next request.`);
      throw new UnauthorizedException('Failed to refresh access token. Please try again or reconnect Google Search Console.');
    }
  }

  /**
   * Process GSC API data with separate calls for accurate aggregation
   */
  private processGscDataMulti(
    dto: GscDataQueryDto,
    dailyRows: any[],
    queryRows: any[],
    pageRows: any[],
  ): GscPerformanceData {
    // Process daily rows for accurate totals
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPositionWeighted = 0;
    const dailyMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();

    dailyRows.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      
      totalClicks += clicks;
      totalImpressions += impressions;
      totalPositionWeighted += position * impressions;

      const date = row.keys?.[0];
      if (date) {
        // Ensure date is in YYYY-MM-DD format
        const normalizedDate = date.length === 10 ? date : date.split('T')[0];
        if (!dailyMap.has(normalizedDate)) {
          dailyMap.set(normalizedDate, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const daily = dailyMap.get(normalizedDate)!;
        daily.clicks += clicks;
        daily.impressions += impressions;
        daily.positionWeighted += position * impressions;
      }
    });
    
    this.logger.log(`[GSC] Processed ${dailyRows.length} daily rows into ${dailyMap.size} unique dates`);

    // Process query rows for top queries
    const queryMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();
    queryRows.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      const keys = row.keys || [];
      const query = keys.find((k: string) => k && !k.match(/^\d{4}-\d{2}-\d{2}$/));
      
      if (query) {
        if (!queryMap.has(query)) {
          queryMap.set(query, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const queryData = queryMap.get(query)!;
        queryData.clicks += clicks;
        queryData.impressions += impressions;
        queryData.positionWeighted += position * impressions;
      }
    });

    // Process page rows for top pages
    const pageMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();
    pageRows.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      const keys = row.keys || [];
      const page = keys.find((k: string) => k && (k.startsWith('http') || k.startsWith('sc-domain:')));
      
      if (page) {
        if (!pageMap.has(page)) {
          pageMap.set(page, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const pageData = pageMap.get(page)!;
        pageData.clicks += clicks;
        pageData.impressions += impressions;
        pageData.positionWeighted += position * impressions;
      }
    });

    // Calculate averages
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = totalImpressions > 0 ? totalPositionWeighted / totalImpressions : 0;

    // Build arrays
    const dailyPerformance = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topQueries = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    const topPages = Array.from(pageMap.entries())
      .map(([page, data]) => ({
        page,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    return {
      siteUrl: dto.siteUrl,
      totalClicks,
      totalImpressions,
      averageCtr: parseFloat(avgCtr.toFixed(2)),
      averagePosition: parseFloat(avgPosition.toFixed(1)),
      dailyPerformance,
      topQueries,
      topPages,
      topCountries: [],
      topDevices: [],
      startDate: dto.startDate,
      endDate: dto.endDate,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Process GSC API data (legacy method - kept for backward compatibility)
   */
  private processGscData(dto: GscDataQueryDto, rows: any[]): GscPerformanceData {
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPositionWeighted = 0; // Weighted by impressions for accurate average
    const dailyMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();
    const queryMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();
    const pageMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number }>();

    this.logger.log(`[GSC] Processing ${rows.length} rows of data`);

    rows.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      
      totalClicks += clicks;
      totalImpressions += impressions;
      totalPositionWeighted += position * impressions; // Weight position by impressions

      // Process by dimensions - keys array contains values in order of requested dimensions
      const keys = row.keys || [];
      
      // Find date (always first if date dimension is requested, format: YYYY-MM-DD)
      const dateKey = keys.find((k: string) => k && k.match(/^\d{4}-\d{2}-\d{2}$/));
      if (dateKey) {
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const daily = dailyMap.get(dateKey)!;
        daily.clicks += clicks;
        daily.impressions += impressions;
        daily.positionWeighted += position * impressions;
      }

      // Find query (any key that's not a date and not a URL)
      const queryKey = keys.find((k: string) => 
        k && 
        !k.match(/^\d{4}-\d{2}-\d{2}$/) && 
        !k.startsWith('http') &&
        !k.startsWith('sc-domain:')
      );
      if (queryKey) {
        if (!queryMap.has(queryKey)) {
          queryMap.set(queryKey, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const queryData = queryMap.get(queryKey)!;
        queryData.clicks += clicks;
        queryData.impressions += impressions;
        queryData.positionWeighted += position * impressions;
      }

      // Find page (any key that starts with http or is a domain property)
      const pageKey = keys.find((k: string) => k && (k.startsWith('http') || k.startsWith('sc-domain:')));
      if (pageKey) {
        if (!pageMap.has(pageKey)) {
          pageMap.set(pageKey, { clicks: 0, impressions: 0, positionWeighted: 0 });
        }
        const pageData = pageMap.get(pageKey)!;
        pageData.clicks += clicks;
        pageData.impressions += impressions;
        pageData.positionWeighted += position * impressions;
      }
    });

    // Calculate averages correctly
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = totalImpressions > 0 ? totalPositionWeighted / totalImpressions : 0;

    this.logger.log(`[GSC] Aggregated totals: ${totalClicks} clicks, ${totalImpressions} impressions, ${avgPosition.toFixed(1)} avg position`);

    // Build daily performance array with weighted average position
    // Ensure all dates in the range are included (fill missing dates with zeros)
    // Parse dates as local dates (not UTC) to avoid timezone issues
    const startDateParts = dto.startDate.split('-').map(Number);
    const endDateParts = dto.endDate.split('-').map(Number);
    const startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
    const endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]);
    const allDates: string[] = [];
    
    // Iterate through all dates from start to end (inclusive)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      allDates.push(dateStr);
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const dailyPerformance = allDates.map((date) => {
      const data = dailyMap.get(date);
      if (data) {
        return {
          date,
          clicks: data.clicks,
          impressions: data.impressions,
          ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
          position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
        };
      } else {
        // Fill missing dates with zeros
        return {
          date,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
        };
      }
    });
    
    this.logger.log(`[GSC] Built daily performance array with ${dailyPerformance.length} days (from ${dto.startDate} to ${dto.endDate})`);

    // Build top queries (sorted by clicks) with weighted average position
    const topQueries = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    // Build top pages (sorted by clicks) with weighted average position
    const topPages = Array.from(pageMap.entries())
      .map(([page, data]) => ({
        page,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    return {
      siteUrl: dto.siteUrl,
      totalClicks,
      totalImpressions,
      averageCtr: parseFloat(avgCtr.toFixed(2)),
      averagePosition: parseFloat(avgPosition.toFixed(1)),
      dailyPerformance,
      topQueries,
      topPages,
      topCountries: [], // Will be populated if country dimension is requested
      topDevices: [], // Will be populated if device dimension is requested
      startDate: dto.startDate,
      endDate: dto.endDate,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Export with alias
export { GoogleSearchConsoleService as GSCService };
