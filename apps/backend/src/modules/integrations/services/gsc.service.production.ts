import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { GSCIntegrationEntity } from '../../../infrastructure/database/entities/gsc-integration.entity';
import { GSCIntegrationRepository } from '../../../infrastructure/database/repositories/gsc-integration.repository';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import {
  GscDataQueryDto,
  GscPerformanceData,
  GscSite,
  GscDimension,
  GscDailyPerformance,
  GscQuery,
  GscPage,
  GscCountry,
  GscDevice,
} from '@riviso/shared-types';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

@Injectable()
export class GoogleSearchConsoleService {
  private readonly logger = new Logger(GoogleSearchConsoleService.name);
  private readonly GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';
  private readonly OAUTH_BASE = 'https://oauth2.googleapis.com';

  constructor(
    private configService: ConfigService,
    private gscRepository: GSCIntegrationRepository,
  ) {}

  /**
   * Get encryption key from environment
   */
  private getEncryptionKey(): string {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    return key;
  }

  /**
   * Generate OAuth2 authorization URL for Google Search Console
   */
  async getAuthUrl(userId: string): Promise<{ authUrl: string }> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI', 'http://localhost:3000/dashboard/integrations/gsc/callback');

    if (!clientId) {
      throw new BadRequestException('Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/webmasters.readonly',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: userId, // Pass userId to identify user after OAuth
      include_granted_scopes: 'true',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    this.logger.log(`Generated GSC auth URL for user: ${userId}`);
    return { authUrl };
  }

  /**
   * Exchange authorization code for access token and save to database
   */
  async handleOAuthCallback(
    code: string,
    state: string, // userId
    userId: string,
  ): Promise<GSCIntegrationEntity> {
    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForToken(code);

      // Fetch user's GSC sites
      const sites = await this.fetchSitesFromGoogle(tokens.access_token);

      if (!sites || sites.length === 0) {
        throw new BadRequestException('No Google Search Console properties found for this account. Please add a property first.');
      }

      // Use the first site as primary
      const primarySite = sites[0];

      // Encrypt tokens before storing
      const encryptionKey = this.getEncryptionKey();
      const encryptedAccessToken = EncryptionUtil.encrypt(tokens.access_token, encryptionKey);
      const encryptedRefreshToken = tokens.refresh_token 
        ? EncryptionUtil.encrypt(tokens.refresh_token, encryptionKey)
        : encryptedAccessToken;

      // Deactivate all existing integrations for this user
      await this.gscRepository.deactivateAllForUser(userId);

      // Create new integration
      const integration = await this.gscRepository.create({
        userId,
        siteUrl: primarySite.siteUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        permissionLevel: primarySite.permissionLevel,
        isActive: true,
        metadata: {
          scope: tokens.scope,
          tokenType: tokens.token_type,
        },
      });

      this.logger.log(`GSC connected for user ${userId}, site: ${primarySite.siteUrl}`);
      return integration;
    } catch (error) {
      this.logger.error(`OAuth callback error: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Google error: ${JSON.stringify(error.response.data)}`);
      }
      throw new UnauthorizedException('Failed to authenticate with Google Search Console');
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI', 'http://localhost:3000/dashboard/integrations/gsc/callback');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth credentials not configured');
    }

    try {
      const response = await axios.post<TokenResponse>(
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
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Token exchange error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    try {
      const response = await axios.post<TokenResponse>(
        `${this.OAUTH_BASE}/token`,
        {
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh access token. Please reconnect your account.');
    }
  }

  /**
   * Get valid access token (refreshes if expired)
   */
  private async getValidAccessToken(integration: GSCIntegrationEntity): Promise<string> {
    const encryptionKey = this.getEncryptionKey();
    
    // Check if token is expired
    if (Date.now() >= integration.expiresAt) {
      this.logger.log(`Token expired for user ${integration.userId}, refreshing...`);
      
      // Decrypt refresh token
      const refreshToken = EncryptionUtil.decrypt(integration.refreshToken, encryptionKey);
      
      // Get new access token
      const newAccessToken = await this.refreshAccessToken(refreshToken);
      
      // Encrypt and update in database
      const encryptedAccessToken = EncryptionUtil.encrypt(newAccessToken, encryptionKey);
      await this.gscRepository.update(integration.id, {
        accessToken: encryptedAccessToken,
        expiresAt: Date.now() + (3600 * 1000), // 1 hour
      });
      
      return newAccessToken;
    }
    
    // Decrypt and return current token
    return EncryptionUtil.decrypt(integration.accessToken, encryptionKey);
  }

  /**
   * Fetch user's GSC sites from Google API
   */
  private async fetchSitesFromGoogle(accessToken: string): Promise<GscSite[]> {
    try {
      const response = await axios.get(
        `${this.GSC_API_BASE}/sites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.siteEntry || [];
    } catch (error) {
      this.logger.error(`Error fetching sites: ${error.message}`);
      throw new BadRequestException('Failed to fetch Google Search Console properties');
    }
  }

  /**
   * Get connected GSC account for user
   */
  async getConnectedAccount(userId: string): Promise<GSCIntegrationEntity | null> {
    return this.gscRepository.findActiveByUserId(userId);
  }

  /**
   * Check GSC connection status
   */
  async getConnectionStatus(userId: string): Promise<{ connected: boolean; siteUrl?: string }> {
    const integration = await this.gscRepository.findActiveByUserId(userId);
    
    return {
      connected: !!integration,
      siteUrl: integration?.siteUrl,
    };
  }

  /**
   * Disconnect GSC account
   */
  async disconnect(userId: string): Promise<boolean> {
    await this.gscRepository.deactivateAllForUser(userId);
    this.logger.log(`GSC disconnected for user: ${userId}`);
    return true;
  }

  /**
   * Fetch performance data from Google Search Console API
   */
  async getPerformanceData(userId: string, dto: GscDataQueryDto): Promise<GscPerformanceData> {
    // Get active integration
    const integration = await this.gscRepository.findActiveByUserId(userId);
    
    if (!integration) {
      throw new UnauthorizedException('Google Search Console not connected. Please connect your account first.');
    }

    // Get valid access token (auto-refreshes if expired)
    const accessToken = await this.getValidAccessToken(integration);

    try {
      // Call Google Search Console API
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const rows = response.data.rows || [];
      
      // Process and aggregate data
      return this.processGscData(dto, rows);
    } catch (error) {
      this.logger.error(`Error fetching GSC data: ${error.message}`);
      
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Authentication failed. Please reconnect your Google Search Console account.');
      }
      
      throw new BadRequestException('Failed to fetch Google Search Console data');
    }
  }

  /**
   * Process raw GSC API data into structured format
   */
  private processGscData(dto: GscDataQueryDto, rows: any[]): GscPerformanceData {
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalCtr = 0;
    let totalPosition = 0;

    const dailyMap = new Map<string, GscDailyPerformance>();
    const queryMap = new Map<string, GscQuery>();
    const pageMap = new Map<string, GscPage>();

    rows.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const ctr = row.ctr || 0;
      const position = row.position || 0;

      totalClicks += clicks;
      totalImpressions += impressions;
      totalCtr += ctr;
      totalPosition += position;

      // Process by dimensions
      if (row.keys) {
        const [date, query] = row.keys;
        
        // Daily performance
        if (date) {
          if (!dailyMap.has(date)) {
            dailyMap.set(date, {
              date,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              position: 0,
            });
          }
          const daily = dailyMap.get(date)!;
          daily.clicks += clicks;
          daily.impressions += impressions;
          daily.ctr = (daily.clicks / daily.impressions) * 100;
          daily.position = position; // Use latest position
        }

        // Top queries
        if (query) {
          if (!queryMap.has(query)) {
            queryMap.set(query, {
              query,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              position: 0,
            });
          }
          const queryData = queryMap.get(query)!;
          queryData.clicks += clicks;
          queryData.impressions += impressions;
          queryData.ctr = (queryData.clicks / queryData.impressions) * 100;
          queryData.position = position;
        }
      }
    });

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = rows.length > 0 ? totalPosition / rows.length : 0;

    return {
      siteUrl: dto.siteUrl,
      totalClicks,
      totalImpressions,
      averageCtr: parseFloat(avgCtr.toFixed(2)),
      averagePosition: parseFloat(avgPosition.toFixed(1)),
      dailyPerformance: Array.from(dailyMap.values()).slice(0, 90),
      topQueries: Array.from(queryMap.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20),
      topPages: Array.from(pageMap.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20),
      topCountries: [],
      topDevices: [],
      startDate: dto.startDate,
      endDate: dto.endDate,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get all sites for authenticated user
   */
  async getSites(userId: string): Promise<GscSite[]> {
    const integration = await this.gscRepository.findActiveByUserId(userId);
    
    if (!integration) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    const accessToken = await this.getValidAccessToken(integration);
    return this.fetchSitesFromGoogle(accessToken);
  }
}
