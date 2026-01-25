import { Injectable, Logger, BadRequestException, UnauthorizedException, Inject, forwardRef, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GSCService } from '../integrations/services/gsc.service';
import { WebScraperService } from '../seo/services/web-scraper.service';
import { GscQueryDto } from './dto/gsc-query.dto';
import { GscDimension } from '@riviso/shared-types';

@Injectable()
export class SearchConsoleService {
  private readonly logger = new Logger(SearchConsoleService.name);
  private readonly GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

  constructor(
    @Inject(forwardRef(() => GSCService))
    private readonly gscService: GSCService,
    private readonly configService: ConfigService,
    @Optional() private readonly webScraperService?: WebScraperService,
  ) {}

  /**
   * Get GSC connection access token (internal method)
   */
  private async getAccessToken(userId: string): Promise<string> {
    // Check connection status
    const connectionStatus = await this.gscService.getConnectionStatus(userId);
    if (!connectionStatus.connected) {
      throw new UnauthorizedException('Google Search Console not connected');
    }
    
    // Access internal connections map
    const gscServiceInternal = this.gscService as any;
    const connections = gscServiceInternal.connections as Map<string, any>;
    
    if (!connections) {
      throw new UnauthorizedException('GSC service not properly initialized');
    }
    
    const connection = connections.get(userId);
    if (!connection) {
      throw new UnauthorizedException('GSC connection not found');
    }
    
    // Check if token needs refresh (expires in less than 5 minutes)
    if (Date.now() >= connection.expiresAt - 300000) {
      this.logger.log(`Refreshing access token for user: ${userId}`);
      await this.refreshAccessToken(userId, connection);
      // Re-fetch connection after refresh
      const refreshedConnection = connections.get(userId);
      if (refreshedConnection) {
        return refreshedConnection.accessToken;
      }
    }
    
    return connection.accessToken;
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(userId: string, connection: any): Promise<void> {
    try {
      const gscServiceInternal = this.gscService as any;
      const oauthConfig = gscServiceInternal.oauthConfig;
      const connections = gscServiceInternal.connections as Map<string, any>;
      
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: oauthConfig.getClientId(),
          client_secret: oauthConfig.getClientSecret(),
          refresh_token: connection.refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // Update connection
      connection.accessToken = response.data.access_token;
      connection.expiresAt = Date.now() + (response.data.expires_in * 1000);
      if (response.data.refresh_token) {
        connection.refreshToken = response.data.refresh_token;
      }

      // Update connection in map
      connections.set(userId, connection);
      
      // Save updated connection (via connection store)
      const connectionStore = gscServiceInternal.connectionStore;
      if (connectionStore) {
        connectionStore.saveConnections(connections);
      }
      this.logger.log(`Access token refreshed successfully for user: ${userId}`);
    } catch (error: any) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh access token. Please reconnect Google Search Console.');
    }
  }

  /**
   * Map website URL to GSC property URL
   * This ensures we only fetch data for the mapped website property
   */
  private async getMappedProperty(userId: string, websiteUrl: string): Promise<string> {
    // Get user's GSC connection
    const connection = await this.gscService.getConnectionStatus(userId);
    if (!connection.connected || !connection.siteUrl) {
      throw new UnauthorizedException('Google Search Console not connected');
    }

    // Get all available GSC properties
    const sites = await this.gscService.getSites(userId);
    
    // Match website URL to GSC property
    try {
      const url = new URL(websiteUrl);
      const domain = url.hostname.replace(/^www\./, '');
      
      // Try to find matching property
      for (const site of sites) {
        const siteUrl = site.siteUrl;
        
        // Match domain property
        if (siteUrl.startsWith('sc-domain:')) {
          const propDomain = siteUrl.replace('sc-domain:', '');
          if (propDomain === domain || propDomain === `www.${domain}`) {
            this.logger.log(`Mapped website ${websiteUrl} to GSC property: ${siteUrl}`);
            return siteUrl;
          }
        }
        
        // Match URL prefix property
        if (siteUrl.startsWith('http')) {
          try {
            const siteUrlObj = new URL(siteUrl);
            const siteDomain = siteUrlObj.hostname.replace(/^www\./, '');
            if (siteDomain === domain) {
              this.logger.log(`Mapped website ${websiteUrl} to GSC property: ${siteUrl}`);
              return siteUrl;
            }
          } catch {
            // Invalid URL, skip
          }
        }
      }
      
      // If no exact match, use the first available property (fallback)
      if (sites.length > 0) {
        this.logger.warn(`No exact match found for ${websiteUrl}, using first available property: ${sites[0].siteUrl}`);
        return sites[0].siteUrl;
      }
      
      throw new BadRequestException(`No GSC property found matching website: ${websiteUrl}`);
    } catch (error) {
      this.logger.error(`Error mapping website to GSC property: ${error.message}`);
      throw new BadRequestException(`Failed to map website to GSC property: ${error.message}`);
    }
  }

  /**
   * Get search performance data
   */
  async getPerformanceData(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    
    // Use existing GSC service method
    return this.gscService.getPerformanceData(userId, {
      siteUrl: propertyUrl,
      startDate: dto.startDate,
      endDate: dto.endDate,
      dimensions: dto.dimensions || [GscDimension.DATE, GscDimension.QUERY],
    });
  }

  /**
   * Get top pages
   */
  async getTopPages(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    const accessToken = await this.getAccessToken(userId);

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.DATE, GscDimension.PAGE],
        rowLimit: dto.rowLimit || 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Process and aggregate by page
    const pageMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number; count: number }>();
    
    (response.data.rows || []).forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      const keys = row.keys || [];
      const page = keys.find((k: string) => k && (k.startsWith('http') || k.startsWith('sc-domain:')));
      
      if (page) {
        if (!pageMap.has(page)) {
          pageMap.set(page, { clicks: 0, impressions: 0, positionWeighted: 0, count: 0 });
        }
        const pageData = pageMap.get(page)!;
        pageData.clicks += clicks;
        pageData.impressions += impressions;
        pageData.positionWeighted += position * impressions;
        pageData.count += 1;
      }
    });

    return Array.from(pageMap.entries())
      .map(([page, data]) => ({
        page,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, dto.rowLimit || 100);
  }

  /**
   * Get top queries/keywords
   */
  async getTopQueries(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    const accessToken = await this.getAccessToken(userId);

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.DATE, GscDimension.QUERY],
        rowLimit: dto.rowLimit || 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Process and aggregate by query
    const queryMap = new Map<string, { clicks: number; impressions: number; positionWeighted: number; count: number }>();
    
    (response.data.rows || []).forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      const keys = row.keys || [];
      const query = keys.find((k: string) => k && !k.match(/^\d{4}-\d{2}-\d{2}$/));
      
      if (query) {
        if (!queryMap.has(query)) {
          queryMap.set(query, { clicks: 0, impressions: 0, positionWeighted: 0, count: 0 });
        }
        const queryData = queryMap.get(query)!;
        queryData.clicks += clicks;
        queryData.impressions += impressions;
        queryData.positionWeighted += position * impressions;
        queryData.count += 1;
      }
    });

    let results = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.positionWeighted / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    // Apply filters
    if (dto.minPosition) {
      results = results.filter(r => r.position >= dto.minPosition!);
    }
    if (dto.maxPosition) {
      results = results.filter(r => r.position <= dto.maxPosition!);
    }
    if (dto.minCtr) {
      results = results.filter(r => r.ctr >= dto.minCtr!);
    }
    if (dto.minImpressions) {
      results = results.filter(r => r.impressions >= dto.minImpressions!);
    }
    if (dto.queryFilter) {
      results = results.filter(r => r.query.toLowerCase().includes(dto.queryFilter!.toLowerCase()));
    }

    return results.slice(0, dto.rowLimit || 100);
  }

  /**
   * Get device breakdown
   */
  async getDevices(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    const accessToken = await this.getAccessToken(userId);

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.DEVICE],
        rowLimit: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (response.data.rows || []).map((row: any) => ({
      device: row.keys?.[0] || 'UNKNOWN',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.impressions > 0 ? ((row.clicks || 0) / row.impressions) * 100 : 0,
      position: row.position || 0,
    }));
  }

  /**
   * Get country breakdown
   */
  async getCountries(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    const accessToken = await this.getAccessToken(userId);

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.COUNTRY],
        rowLimit: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (response.data.rows || []).map((row: any) => ({
      country: row.keys?.[0] || 'UNKNOWN',
      countryName: this.getCountryName(row.keys?.[0] || ''),
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.impressions > 0 ? ((row.clicks || 0) / row.impressions) * 100 : 0,
      position: row.position || 0,
    })).sort((a: any, b: any) => b.clicks - a.clicks);
  }

  /**
   * Fetch aggregated rows by a single dimension (PAGE or QUERY) for a date range.
   * Used for Insights trending (current vs prior period).
   */
  private async fetchAggregatedByDimension(
    userId: string,
    websiteId: string,
    startDate: string,
    endDate: string,
    dimension: 'page' | 'query',
  ): Promise<Array<{ key: string; clicks: number; impressions: number }>> {
    const propertyUrl = await this.getMappedProperty(userId, websiteId);
    const accessToken = await this.getAccessToken(userId);
    const dim = dimension === 'page' ? GscDimension.PAGE : GscDimension.QUERY;

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate,
        endDate,
        dimensions: [dim],
        rowLimit: 5000,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const rows = response.data?.rows || [];
    return rows.map((row: any) => ({
      key: row.keys?.[0] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
    })).filter((r: { key: string }) => r.key);
  }

  /**
   * Compute prior period (same length as current) ending the day before startDate.
   */
  private priorPeriod(startDate: string, endDate: string): { priorStart: string; priorEnd: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const priorEnd = new Date(start);
    priorEnd.setDate(priorEnd.getDate() - 1);
    const priorStart = new Date(priorEnd);
    priorStart.setDate(priorStart.getDate() - days + 1);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { priorStart: fmt(priorStart), priorEnd: fmt(priorEnd) };
  }

  /**
   * Build Top / Trending up / Trending down from current and prior aggregated data.
   */
  private buildTrending<T extends { key: string; clicks: number; impressions: number }>(
    current: T[],
    prior: T[],
    limit = 50,
  ): { top: T[]; trendingUp: (T & { change: string })[]; trendingDown: (T & { change: string })[] } {
    const priorMap = new Map(prior.map((p) => [p.key, p.clicks]));
    const withChange = current.map((c) => {
      const prev = priorMap.get(c.key) ?? 0;
      let change: string;
      if (prev === 0) change = 'Previously 0';
      else {
        const pct = ((c.clicks - prev) / prev) * 100;
        change = pct >= 0 ? `↑ ${pct.toFixed(0)}%` : `↓ ${Math.abs(pct).toFixed(0)}%`;
      }
      return { ...c, change, priorClicks: prev };
    });

    const top = [...withChange].sort((a, b) => b.clicks - a.clicks).slice(0, limit)
      .map(({ change: _c, priorClicks: _p, ...t }) => t as unknown as T);
    const trendingUp = withChange
      .filter((x) => x.priorClicks === 0 || (x.clicks - x.priorClicks) > 0)
      .sort((a, b) => (b.clicks - b.priorClicks) - (a.clicks - a.priorClicks))
      .slice(0, limit)
      .map(({ priorClicks: _, ...rest }) => rest as unknown as T & { change: string });
    const trendingDown = withChange
      .filter((x) => x.priorClicks > 0 && (x.clicks - x.priorClicks) < 0)
      .sort((a, b) => (a.clicks - a.priorClicks) - (b.clicks - b.priorClicks))
      .slice(0, limit)
      .map(({ priorClicks: _, ...rest }) => rest as unknown as T & { change: string });

    return { top, trendingUp, trendingDown };
  }

  /**
   * Get Insights payload: Your content, Queries, Top countries, Additional traffic sources.
   * All from Google Search Console. Trending = current vs prior period.
   */
  async getInsights(userId: string, dto: GscQueryDto) {
    const { startDate, endDate, websiteId } = dto;
    const { priorStart, priorEnd } = this.priorPeriod(startDate, endDate);

    const [
      perf,
      pagesCurrent,
      pagesPrior,
      queriesCurrent,
      queriesPrior,
      countries,
      appearance,
    ] = await Promise.all([
      this.getPerformanceData(userId, { ...dto, dimensions: [GscDimension.DATE] }),
      this.fetchAggregatedByDimension(userId, websiteId, startDate, endDate, 'page'),
      this.fetchAggregatedByDimension(userId, websiteId, priorStart, priorEnd, 'page'),
      this.fetchAggregatedByDimension(userId, websiteId, startDate, endDate, 'query'),
      this.fetchAggregatedByDimension(userId, websiteId, priorStart, priorEnd, 'query'),
      this.getCountries(userId, { ...dto, startDate, endDate, websiteId }),
      this.getSearchAppearance(userId, { ...dto, startDate, endDate, websiteId }),
    ]);

    const yourContent = this.buildTrending(
      pagesCurrent.map((p) => ({ key: p.key, clicks: p.clicks, impressions: p.impressions })),
      pagesPrior.map((p) => ({ key: p.key, clicks: p.clicks, impressions: p.impressions })),
      50,
    );
    const queries = this.buildTrending(
      queriesCurrent.map((q) => ({ key: q.key, clicks: q.clicks, impressions: q.impressions })),
      queriesPrior.map((q) => ({ key: q.key, clicks: q.clicks, impressions: q.impressions })),
      50,
    );

    const additionalTrafficSources = (appearance as any[]).map((a) => ({
      source: this.searchAppearanceLabel(a.appearance),
      clicks: a.clicks,
      impressions: a.impressions,
    }));

    const kpis = perf as any;
    return {
      startDate,
      endDate,
      totalClicks: kpis.totalClicks ?? 0,
      totalImpressions: kpis.totalImpressions ?? 0,
      averageCtr: kpis.averageCtr ?? 0,
      averagePosition: kpis.averagePosition ?? 0,
      yourContent: {
        top: yourContent.top,
        trendingUp: yourContent.trendingUp,
        trendingDown: yourContent.trendingDown,
      },
      queries: {
        top: queries.top,
        trendingUp: queries.trendingUp,
        trendingDown: queries.trendingDown,
      },
      topCountries: countries,
      additionalTrafficSources,
    };
  }

  private searchAppearanceLabel(appearance: string): string {
    const labels: Record<string, string> = {
      WEB: 'Web',
      IMAGE: 'Image search',
      VIDEO: 'Video',
      NEWS: 'News',
      DISCOVER: 'Discover',
      // GSC may return others
    };
    return labels[appearance] ?? appearance;
  }

  /**
   * Get search appearance breakdown
   */
  async getSearchAppearance(userId: string, dto: GscQueryDto) {
    const propertyUrl = await this.getMappedProperty(userId, dto.websiteId);
    const accessToken = await this.getAccessToken(userId);

    const response = await axios.post(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        dimensions: [GscDimension.SEARCH_APPEARANCE],
        rowLimit: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (response.data.rows || []).map((row: any) => ({
      appearance: row.keys?.[0] || 'UNKNOWN',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.impressions > 0 ? ((row.clicks || 0) / row.impressions) * 100 : 0,
      position: row.position || 0,
    })).sort((a: any, b: any) => b.clicks - a.clicks);
  }

  /**
   * Get indexing and coverage data
   */
  async getIndexingData(userId: string, websiteId: string) {
    const propertyUrl = await this.getMappedProperty(userId, websiteId);
    const accessToken = await this.getAccessToken(userId);

    // Get sitemaps
    const sitemapsResponse = await axios.get(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/sitemaps`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch(() => ({ data: { sitemap: [] } }));

    // Get URL inspection data (sample - requires individual URL inspection)
    // For now, return sitemap data
    return {
      sitemaps: sitemapsResponse.data.sitemap || [],
      indexedPages: 0, // Would require URL inspection API calls
      notIndexedPages: 0,
      errors: [],
    };
  }

  /**
   * Get Core Web Vitals data
   */
  async getCoreWebVitals(userId: string, websiteId: string) {
    // Core Web Vitals requires different API endpoint
    // For now, return placeholder structure
    return {
      desktop: {
        lcp: { good: 0, needsImprovement: 0, poor: 0 },
        fid: { good: 0, needsImprovement: 0, poor: 0 },
        cls: { good: 0, needsImprovement: 0, poor: 0 },
      },
      mobile: {
        lcp: { good: 0, needsImprovement: 0, poor: 0 },
        fid: { good: 0, needsImprovement: 0, poor: 0 },
        cls: { good: 0, needsImprovement: 0, poor: 0 },
      },
    };
  }

  /**
   * Get security and manual actions
   */
  async getSecurityData(userId: string, websiteId: string) {
    const propertyUrl = await this.getMappedProperty(userId, websiteId);
    const accessToken = await this.getAccessToken(userId);

    // Get manual actions
    const manualActionsResponse = await axios.get(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/manualActions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch(() => ({ data: { manualAction: [] } }));

    // Get security issues
    const securityResponse = await axios.get(
      `${this.GSC_API_BASE}/sites/${encodeURIComponent(propertyUrl)}/securityIssues`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch(() => ({ data: { issue: [] } }));

    return {
      manualActions: manualActionsResponse.data.manualAction || [],
      securityIssues: securityResponse.data.issue || [],
    };
  }

  /**
   * Get internal links data. Uses web scraper when available; otherwise placeholder.
   */
  async getInternalLinks(userId: string, websiteId: string) {
    const links = await this.getLinks(userId, websiteId);
    return {
      topLinkedPages: links.internal.topLinkedPages,
      orphanPages: links.internal.orphanPages,
    };
  }

  /**
   * Normalize websiteId to a fetchable URL (ensure protocol).
   */
  private normalizeWebsiteUrl(websiteId: string): string {
    const raw = (websiteId || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '') || raw;
    return `https://${raw.replace(/\/+$/, '')}`;
  }

  /**
   * Get combined Links report (GSC-style): internal, external, top linking sites, top linking text.
   * Uses web scraper on the site URL when available; otherwise returns empty structure.
   */
  async getLinks(userId: string, websiteId: string) {
    const empty = {
      internal: {
        total: 0,
        topLinkedPages: [] as Array<{ url: string; inboundLinks: number }>,
        orphanPages: [] as Array<{ url: string }>,
      },
      external: {
        total: 0,
        topLinkedPages: [] as Array<{ url: string; inboundLinks: number }>,
        topLinkingSites: [] as Array<{ site: string; links: number }>,
        topLinkingText: [] as Array<{ text: string; links: number }>,
      },
    };

    if (!this.webScraperService) {
      this.logger.warn('WebScraperService not available; returning empty Links data');
      return empty;
    }

    const url = this.normalizeWebsiteUrl(websiteId);
    if (!url) {
      this.logger.warn('Links: empty or invalid websiteId');
      return empty;
    }

    try {
      this.logger.log(`Links: scraping ${url} for link data`);
      const scraped = await this.webScraperService.scrapePage(url);
      const links = scraped?.onPageSEO?.links;
      if (!links) return empty;

      const internalLinks = links.internal?.links ?? [];
      const externalLinks = links.external?.links ?? [];

      const internalByUrl = new Map<string, number>();
      for (const { url: u } of internalLinks) {
        const key = (u || '').trim();
        if (!key) continue;
        internalByUrl.set(key, (internalByUrl.get(key) ?? 0) + 1);
      }
      const topLinkedPages = Array.from(internalByUrl.entries())
        .map(([u, c]) => ({ url: u, inboundLinks: c }))
        .sort((a, b) => b.inboundLinks - a.inboundLinks)
        .slice(0, 100);

      const externalByUrl = new Map<string, number>();
      const externalByHost = new Map<string, number>();
      const externalByText = new Map<string, number>();
      for (const { url: u, anchorText } of externalLinks) {
        const key = (u || '').trim();
        if (!key) continue;
        externalByUrl.set(key, (externalByUrl.get(key) ?? 0) + 1);
        try {
          const host = new URL(key).host;
          externalByHost.set(host, (externalByHost.get(host) ?? 0) + 1);
        } catch {
          /* ignore malformed URL */
        }
        const text = (anchorText || '').trim() || '(empty)';
        externalByText.set(text, (externalByText.get(text) ?? 0) + 1);
      }

      const externalTopPages = Array.from(externalByUrl.entries())
        .map(([u, c]) => ({ url: u, inboundLinks: c }))
        .sort((a, b) => b.inboundLinks - a.inboundLinks)
        .slice(0, 100);
      const topLinkingSites = Array.from(externalByHost.entries())
        .map(([site, links]) => ({ site, links }))
        .sort((a, b) => b.links - a.links)
        .slice(0, 50);
      const topLinkingText = Array.from(externalByText.entries())
        .map(([text, links]) => ({ text, links }))
        .sort((a, b) => b.links - a.links)
        .slice(0, 50);

      const internalTotal = topLinkedPages.reduce((s, p) => s + p.inboundLinks, 0);
      const externalTotal = externalLinks.length;

      this.logger.log(`Links: internal ${internalTotal}, external ${externalTotal} for ${url}`);

      return {
        internal: {
          total: internalTotal,
          topLinkedPages,
          orphanPages: [], // requires site-wide crawl
        },
        external: {
          total: externalTotal,
          topLinkedPages: externalTopPages,
          topLinkingSites,
          topLinkingText,
        },
      };
    } catch (err: any) {
      this.logger.warn(`Links: scrape failed for ${url}: ${err?.message || err}`);
      return empty;
    }
  }

  /**
   * Helper: Get country name from code
   */
  private getCountryName(code: string): string {
    const countries: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'IN': 'India',
      // Add more as needed
    };
    return countries[code] || code;
  }
}
