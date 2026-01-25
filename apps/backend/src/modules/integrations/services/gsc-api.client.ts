import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { GscSite } from '@riviso/shared-types';

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

export interface GscSitemapEntry {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: number;
  errors?: number;
}

export interface SitemapsListResponse {
  sitemap?: GscSitemapEntry[];
}

/**
 * Low-level HTTP client for Google Search Console API.
 * Caller supplies a valid access token.
 */
@Injectable()
export class GscApiClient {
  private readonly logger = new Logger(GscApiClient.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: GSC_API_BASE,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async request<T>(accessToken: string, config: { method: string; url: string; data?: object }): Promise<T> {
    const { method, url, data } = config;
    const res = await this.client.request<T>({
      method,
      url,
      data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  /**
   * List verified sites (GSC sites.list).
   */
  async listSites(accessToken: string): Promise<GscSite[]> {
    try {
      const data = await this.request<{ siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> }>(
        accessToken,
        { method: 'GET', url: '/sites' },
      );
      const entries = data?.siteEntry ?? [];
      return entries.map((e) => ({ siteUrl: e.siteUrl, permissionLevel: e.permissionLevel }));
    } catch (e: any) {
      this.logger.warn(`listSites failed: ${e?.response?.status} ${e?.message}`);
      throw e;
    }
  }

  /**
   * Query Search Analytics (queries, pages, clicks, impressions, CTR, position).
   */
  async querySearchAnalytics(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions: string[] = ['date', 'query', 'page'],
    rowLimit = 25_000,
  ): Promise<SearchAnalyticsResponse> {
    const url = `/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    try {
      const data = await this.request<SearchAnalyticsResponse>(accessToken, {
        method: 'POST',
        url,
        data: { startDate, endDate, dimensions, rowLimit },
      });
      return data ?? { rows: [] };
    } catch (e: any) {
      this.logger.warn(`querySearchAnalytics failed: ${e?.response?.status} ${e?.message}`);
      throw e;
    }
  }

  /**
   * List sitemaps for a property.
   */
  async listSitemaps(accessToken: string, siteUrl: string): Promise<SitemapsListResponse> {
    const url = `/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
    try {
      const data = await this.request<SitemapsListResponse>(accessToken, { method: 'GET', url });
      return data ?? { sitemap: [] };
    } catch (e: any) {
      this.logger.warn(`listSitemaps failed: ${e?.response?.status} ${e?.message}`);
      throw e;
    }
  }
}
