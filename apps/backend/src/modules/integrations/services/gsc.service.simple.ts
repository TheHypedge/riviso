import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  GscDataQueryDto,
  GscPerformanceData,
  GscSite,
  GscDimension,
} from '@riviso/shared-types';

interface GSCConnection {
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

  constructor(private configService: ConfigService) {}

  /**
   * Generate OAuth2 authorization URL
   */
  async getAuthUrl(userId: string): Promise<{ authUrl: string }> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3000/dashboard/integrations/gsc/callback',
    );

    if (!clientId) {
      throw new BadRequestException(
        'Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables.',
      );
    }

    const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: userId,
      include_granted_scopes: 'true',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    this.logger.log(`Generated GSC auth URL for user: ${userId}`);
    return { authUrl };
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string, userId: string): Promise<GSCConnection> {
    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForToken(code);

      // Fetch user's GSC sites
      const sites = await this.fetchSitesFromGoogle(tokens.access_token);

      if (!sites || sites.length === 0) {
        throw new BadRequestException(
          'No Google Search Console properties found for this account.',
        );
      }

      // Use the first site
      const primarySite = sites[0];

      // Store connection in memory
      const connection: GSCConnection = {
        userId,
        siteUrl: primarySite.siteUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || tokens.access_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        connectedAt: new Date().toISOString(),
      };

      this.connections.set(userId, connection);
      this.logger.log(`GSC connected for user ${userId}, site: ${primarySite.siteUrl}`);

      return connection;
    } catch (error) {
      this.logger.error(`OAuth callback error: ${error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Google Search Console');
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForToken(code: string): Promise<any> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3000/dashboard/integrations/gsc/callback',
    );

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth credentials not configured');
    }

    try {
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

      return response.data;
    } catch (error) {
      this.logger.error(`Token exchange error: ${error.message}`);
      throw error;
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
  async getConnectionStatus(userId: string): Promise<{ connected: boolean; siteUrl?: string }> {
    const connection = this.connections.get(userId);
    return {
      connected: !!connection,
      siteUrl: connection?.siteUrl,
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
