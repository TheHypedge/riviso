import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  GscDataQueryDto,
  GscPerformanceData,
  GscDailyPerformance,
  GscQuery,
  GscPage,
} from '@riviso/shared-types';
import { GscApiClient, SearchAnalyticsRow } from './gsc-api.client';
import { GscPropertyService } from './gsc-property.service';
import { GSCPropertyRepository } from '../../../infrastructure/database/repositories/gsc-property.repository';

@Injectable()
export class GscDataService {
  private readonly logger = new Logger(GscDataService.name);

  constructor(
    private readonly gscApiClient: GscApiClient,
    private readonly gscPropertyService: GscPropertyService,
    private readonly gscPropertyRepo: GSCPropertyRepository,
  ) {}

  /**
   * Fetch Search Analytics (queries, pages, clicks, impressions, CTR, position).
   * Date range: default last 28 days. Group by query + page.
   */
  async getSearchAnalytics(
    userId: string,
    dto: GscDataQueryDto,
  ): Promise<GscPerformanceData> {
    const siteUrl = dto.siteUrl;
    const props = await this.gscPropertyRepo.findByUserId(userId);
    const prop = props.find((p) => p.gscPropertyUrl === siteUrl);
    if (!prop) {
      throw new BadRequestException(
        'No GSC property found for this site. Connect GSC and select this property first.',
      );
    }

    const accessToken = await this.gscPropertyService.getAccessTokenForProperty(prop.id);
    const dimensions = dto.dimensions ?? ['date', 'query', 'page'];
    const dims = Array.isArray(dimensions) ? dimensions : [dimensions];
    const startDate = dto.startDate ?? this.defaultStartDate();
    const endDate = dto.endDate ?? this.defaultEndDate();

    let raw: { rows?: SearchAnalyticsRow[] };
    try {
      raw = await this.gscApiClient.querySearchAnalytics(
        accessToken,
        siteUrl,
        startDate,
        endDate,
        dims.map(String),
        25_000,
      );
    } catch (e: any) {
      this.logger.warn(`searchanalytics.query failed: ${e?.response?.status} ${e?.message}`);
      if (e?.response?.status === 429) {
        throw new BadRequestException('GSC API quota exceeded. Please try again later.');
      }
      throw new BadRequestException('Failed to fetch GSC Search Analytics. Please try again.');
    }

    const rows = raw?.rows ?? [];
    return this.normalizeToGscPerformanceData(siteUrl, startDate, endDate, rows, dims);
  }

  /**
   * Fetch sitemaps for a property.
   */
  async getSitemaps(userId: string, siteUrl: string) {
    const props = await this.gscPropertyRepo.findByUserId(userId);
    const prop = props.find((p) => p.gscPropertyUrl === siteUrl);
    if (!prop) {
      throw new BadRequestException('No GSC property found for this site.');
    }
    const accessToken = await this.gscPropertyService.getAccessTokenForProperty(prop.id);
    return this.gscApiClient.listSitemaps(accessToken, siteUrl);
  }

  private defaultStartDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d.toISOString().split('T')[0];
  }

  private defaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private normalizeToGscPerformanceData(
    siteUrl: string,
    startDate: string,
    endDate: string,
    rows: SearchAnalyticsRow[],
    dimensions: string[],
  ): GscPerformanceData {
    let totalClicks = 0;
    let totalImpressions = 0;
    const dailyMap = new Map<string, GscDailyPerformance>();
    const queryMap = new Map<string, GscQuery>();
    const pageMap = new Map<string, GscPage>();

    for (const r of rows) {
      const keys = r.keys ?? [];
      totalClicks += r.clicks;
      totalImpressions += r.impressions;

      const dateKey = dimensions.includes('date') ? keys[dimensions.indexOf('date')] : null;
      if (dateKey) {
        const existing = dailyMap.get(dateKey);
        if (existing) {
          existing.clicks += r.clicks;
          existing.impressions += r.impressions;
        } else {
          dailyMap.set(dateKey, {
            date: dateKey,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.impressions > 0 ? r.ctr : 0,
            position: r.position,
          });
        }
      }

      const queryKey = dimensions.includes('query') ? keys[dimensions.indexOf('query')] : null;
      if (queryKey) {
        const existing = queryMap.get(queryKey);
        if (existing) {
          existing.clicks += r.clicks;
          existing.impressions += r.impressions;
        } else {
          queryMap.set(queryKey, {
            query: queryKey,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.impressions > 0 ? r.ctr : 0,
            position: r.position,
          });
        }
      }

      const pageKey = dimensions.includes('page') ? keys[dimensions.indexOf('page')] : null;
      if (pageKey) {
        const existing = pageMap.get(pageKey);
        if (existing) {
          existing.clicks += r.clicks;
          existing.impressions += r.impressions;
        } else {
          pageMap.set(pageKey, {
            page: pageKey,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.impressions > 0 ? r.ctr : 0,
            position: r.position,
          });
        }
      }
    }

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const dailyPerformance = Array.from(dailyMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );
    const topQueries = Array.from(queryMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 100);
    const topPages = Array.from(pageMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 100);

    const avgPosition = rows.length
      ? rows.reduce((s, r) => s + r.position, 0) / rows.length
      : 0;

    return {
      siteUrl,
      totalClicks,
      totalImpressions,
      averageCtr: parseFloat(avgCtr.toFixed(4)),
      averagePosition: parseFloat(avgPosition.toFixed(2)),
      dailyPerformance,
      topQueries,
      topPages,
      topCountries: [],
      topDevices: [],
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
    };
  }
}
