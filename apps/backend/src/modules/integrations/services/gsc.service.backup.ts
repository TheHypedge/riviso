import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ConnectGSCDto,
  GSCQueryDto,
  GSCResponse,
  GSCRow,
  GSCSite,
  GSCIntegration,
} from '../dto/google-search-console.dto';

@Injectable()
export class GSCService {
  private readonly logger = new Logger(GSCService.name);
  private readonly GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';
  private readonly OAUTH_BASE = 'https://oauth2.googleapis.com';
  
  // In-memory storage for demo (replace with database in production)
  private integrations: Map<string, GSCIntegration> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Generate OAuth2 authorization URL for Google Search Console
   */
  getAuthorizationUrl(userId: string): string {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID', 'demo-client-id');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/dashboard/integrations/gsc/callback');
    
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
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, userId: string): Promise<any> {
    try {
      const clientId = this.configService.get('GOOGLE_CLIENT_ID', 'demo-client-id');
      const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET', 'demo-client-secret');
      const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/dashboard/integrations/gsc/callback');

      const response = await axios.post(`${this.OAUTH_BASE}/token`, {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error exchanging code for token: ${error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  /**
   * Connect Google Search Console account
   */
  async connectGSC(dto: ConnectGSCDto, userId: string): Promise<{ success: boolean; authUrl?: string }> {
    // In a real implementation, you would:
    // 1. Exchange authorization code for tokens
    // 2. Store tokens securely in database
    // 3. Verify site ownership
    
    // For demo, return mock integration
    if (!dto.authorizationCode) {
      // Return authorization URL
      const authUrl = this.getAuthorizationUrl(userId);
      return { success: false, authUrl };
    }

    // Mock successful connection
    const integration: GSCIntegration = {
      id: `gsc-${Date.now()}`,
      userId,
      siteUrl: dto.siteUrl,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
      connectedAt: new Date(),
    };

    this.integrations.set(userId, integration);
    this.logger.log(`GSC connected for user ${userId}, site: ${dto.siteUrl}`);

    return { success: true };
  }

  /**
   * Check if user has GSC connected
   */
  async isConnected(userId: string): Promise<boolean> {
    return this.integrations.has(userId);
  }

  /**
   * Get connected GSC account details
   */
  async getIntegration(userId: string): Promise<GSCIntegration | null> {
    return this.integrations.get(userId) || null;
  }

  /**
   * Disconnect GSC
   */
  async disconnect(userId: string): Promise<{ success: boolean }> {
    this.integrations.delete(userId);
    return { success: true };
  }

  /**
   * Fetch GSC data (real implementation would call GSC API)
   */
  async fetchGSCData(dto: GSCQueryDto, userId: string): Promise<GSCResponse> {
    const integration = this.integrations.get(userId);
    
    if (!integration) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    // In a real implementation, you would call GSC API here
    // For demo, return realistic mock data
    return this.generateMockGSCData(dto);
  }

  /**
   * Get list of sites from GSC
   */
  async getSites(userId: string): Promise<GSCSite[]> {
    const integration = this.integrations.get(userId);
    
    if (!integration) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    // Mock sites data
    return [
      {
        siteUrl: integration.siteUrl,
        permissionLevel: 'siteOwner',
      },
    ];
  }

  /**
   * Generate realistic mock GSC data
   */
  private generateMockGSCData(dto: GSCQueryDto): GSCResponse {
    const days = this.getDaysBetween(new Date(dto.startDate), new Date(dto.endDate));
    const rows: GSCRow[] = [];

    // Generate data based on dimensions
    if (!dto.dimensions || dto.dimensions.length === 0) {
      // Summary data
      return {
        rows: [],
        totalClicks: 293,
        totalImpressions: 85100,
        avgCTR: 0.34,
        avgPosition: 20.1,
      };
    }

    // Generate data based on primary dimension
    const primaryDimension = dto.dimensions[0];

    switch (primaryDimension) {
      case 'date':
        // Generate daily data
        for (let i = 0; i < days; i++) {
          const date = new Date(dto.startDate);
          date.setDate(date.getDate() + i);
          rows.push({
            keys: [date.toISOString().split('T')[0]],
            clicks: Math.floor(Math.random() * 20) + 5,
            impressions: Math.floor(Math.random() * 3000) + 1000,
            ctr: Math.random() * 0.015 + 0.002,
            position: Math.random() * 15 + 10,
          });
        }
        break;

      case 'query':
        // Generate top queries
        const queries = [
          'hypedge', 'hype edge', 'netflix brand strategy', 'got milk campaign',
          'got milk campaign history', 'netflix brand analysis', 'got milk ad campaign',
          'netflix branding', 'got milk? campaign', 'netflix branding strategy',
        ];
        queries.forEach((query, index) => {
          rows.push({
            keys: [query],
            clicks: Math.floor(Math.random() * 20) + (10 - index),
            impressions: Math.floor(Math.random() * 5000) + (1000 * (10 - index)),
            ctr: Math.random() * 0.02 + 0.002,
            position: Math.random() * 20 + (index * 2),
          });
        });
        break;

      case 'page':
        // Generate top pages
        const pages = [
          '/',
          '/case-studies/',
          '/case-study/got-milk-campaign/',
          '/case-study/netflix-brand-strategy/',
          '/workproofs/',
          '/all-posts/',
          '/contact-us/',
        ];
        pages.forEach((page, index) => {
          rows.push({
            keys: [`${dto.siteUrl}${page}`],
            clicks: Math.floor(Math.random() * 30) + (20 - index * 2),
            impressions: Math.floor(Math.random() * 8000) + (2000 * (7 - index)),
            ctr: Math.random() * 0.025 + 0.003,
            position: Math.random() * 15 + (index * 1.5),
          });
        });
        break;

      case 'country':
        // Generate by country
        const countries = ['USA', 'India', 'UK', 'Canada', 'Australia'];
        countries.forEach((country, index) => {
          rows.push({
            keys: [country],
            clicks: Math.floor(Math.random() * 50) + (50 - index * 8),
            impressions: Math.floor(Math.random() * 15000) + (5000 * (5 - index)),
            ctr: Math.random() * 0.02 + 0.003,
            position: Math.random() * 20 + 10,
          });
        });
        break;

      case 'device':
        // Generate by device
        rows.push(
          {
            keys: ['MOBILE'],
            clicks: 165,
            impressions: 48000,
            ctr: 0.34,
            position: 19.5,
          },
          {
            keys: ['DESKTOP'],
            clicks: 98,
            impressions: 29100,
            ctr: 0.34,
            position: 20.8,
          },
          {
            keys: ['TABLET'],
            clicks: 30,
            impressions: 8000,
            ctr: 0.38,
            position: 19.2,
          }
        );
        break;
    }

    // Calculate totals
    const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
    const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    const avgCTR = totalClicks / totalImpressions;
    const avgPosition = rows.reduce((sum, row) => sum + row.position, 0) / rows.length;

    return {
      rows: rows.slice(0, dto.rowLimit || 1000),
      totalClicks,
      totalImpressions,
      avgCTR,
      avgPosition,
    };
  }

  private getDaysBetween(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
