import { Injectable } from '@nestjs/common';
import { DataSource } from './prompt-mapper.service';

/**
 * Fetches data from various sources based on prompt analysis
 * In production, this would query actual databases
 */

export interface FetchedData {
  source: string;
  type: string;
  data: any;
  recordCount: number;
  queryTime: number;
  confidence: number;
}

export interface DataFetchResult {
  data: FetchedData[];
  totalRecords: number;
  totalQueryTime: number;
  dataSources: string[];
}

@Injectable()
export class DataFetcherService {
  /**
   * Fetch data from multiple sources
   */
  async fetchData(dataSources: DataSource[]): Promise<DataFetchResult> {
    const startTime = Date.now();
    const fetchedData: FetchedData[] = [];

    for (const source of dataSources) {
      const data = await this.fetchFromSource(source);
      fetchedData.push(data);
    }

    const totalQueryTime = Date.now() - startTime;

    return {
      data: fetchedData,
      totalRecords: fetchedData.reduce((sum, d) => sum + d.recordCount, 0),
      totalQueryTime,
      dataSources: fetchedData.map(d => d.source),
    };
  }

  /**
   * Fetch from a specific data source (mock implementation)
   */
  private async fetchFromSource(source: DataSource): Promise<FetchedData> {
    const startTime = Date.now();

    // Simulate query delay
    await new Promise(resolve => setTimeout(resolve, 50));

    let mockData: any;
    let recordCount: number;

    switch (source.type) {
      case 'analytics':
        mockData = this.getMockAnalyticsData(source.name);
        recordCount = mockData.timeline?.length || 0;
        break;
      
      case 'seo':
        mockData = this.getMockSeoData(source.name);
        recordCount = mockData.pages?.length || mockData.issues?.length || 0;
        break;
      
      case 'keywords':
        mockData = this.getMockKeywordData(source.name);
        recordCount = mockData.keywords?.length || 0;
        break;
      
      case 'competitors':
        mockData = this.getMockCompetitorData(source.name);
        recordCount = mockData.competitors?.length || 0;
        break;
      
      default:
        mockData = {};
        recordCount = 0;
    }

    const queryTime = Date.now() - startTime;

    return {
      source: source.name,
      type: source.type,
      data: mockData,
      recordCount,
      queryTime,
      confidence: source.relevance,
    };
  }

  /**
   * Mock analytics data
   */
  private getMockAnalyticsData(sourceName: string): any {
    if (sourceName.includes('Traffic Trend')) {
      return {
        timeline: [
          { date: '2024-01-01', sessions: 5420, users: 4200 },
          { date: '2024-01-08', sessions: 5680, users: 4350 },
          { date: '2024-01-15', sessions: 4120, users: 3200 }, // Drop here
          { date: '2024-01-22', sessions: 4050, users: 3150 },
        ],
        summary: {
          totalSessions: 19270,
          avgSessions: 4817.5,
          dropDate: '2024-01-15',
          dropPercentage: -27.5,
        },
      };
    }
    return {};
  }

  /**
   * Mock SEO data
   */
  private getMockSeoData(sourceName: string): any {
    if (sourceName.includes('CTR by Page')) {
      return {
        pages: [
          {
            url: '/pricing',
            impressions: 8500,
            clicks: 120,
            ctr: 1.41,
            avgPosition: 5.2,
          },
          {
            url: '/features',
            impressions: 6200,
            clicks: 95,
            ctr: 1.53,
            avgPosition: 6.8,
          },
          {
            url: '/blog/seo-guide',
            impressions: 12000,
            clicks: 180,
            ctr: 1.5,
            avgPosition: 4.1,
          },
        ],
        summary: {
          avgCtr: 1.48,
          totalImpressions: 26700,
          totalClicks: 395,
          pagesUnder2Percent: 3,
        },
      };
    }

    if (sourceName.includes('Page Metadata')) {
      return {
        pages: [
          {
            url: '/pricing',
            title: 'Pricing',
            metaDescription: null, // Missing!
            titleLength: 7,
            descriptionLength: 0,
          },
          {
            url: '/features',
            title: 'Features - Product Name',
            metaDescription: 'Features page',
            titleLength: 23,
            descriptionLength: 13, // Too short!
          },
        ],
        issues: [
          'Missing meta descriptions on 2 pages',
          'Title tags too short (< 30 chars) on 1 page',
        ],
      };
    }

    if (sourceName.includes('Recent Changes')) {
      return {
        audits: [
          {
            date: '2024-01-15',
            changes: ['Core Web Vitals degraded', 'LCP increased to 4.2s'],
            score: 72,
          },
          {
            date: '2024-01-08',
            changes: ['Added new pages', 'Improved mobile usability'],
            score: 78,
          },
        ],
      };
    }

    return {};
  }

  /**
   * Mock keyword data
   */
  private getMockKeywordData(sourceName: string): any {
    if (sourceName.includes('Changes')) {
      return {
        keywords: [
          {
            keyword: 'seo tools',
            previousRank: 3,
            currentRank: 7,
            change: -4,
            searchVolume: 8100,
          },
          {
            keyword: 'keyword research',
            previousRank: 5,
            currentRank: 8,
            change: -3,
            searchVolume: 12000,
          },
        ],
        summary: {
          totalDropped: 2,
          avgRankLoss: -3.5,
          estimatedTrafficLoss: 420,
        },
      };
    }

    if (sourceName.includes('Low CTR Keywords')) {
      return {
        keywords: [
          {
            keyword: 'competitor analysis tool',
            rank: 6,
            ctr: 2.1,
            impressions: 1200,
            clicks: 25,
          },
          {
            keyword: 'seo audit software',
            rank: 8,
            ctr: 1.8,
            impressions: 980,
            clicks: 18,
          },
        ],
      };
    }

    return {};
  }

  /**
   * Mock competitor data
   */
  private getMockCompetitorData(sourceName: string): any {
    if (sourceName.includes('Comparison')) {
      return {
        comparisons: [
          {
            keyword: 'seo tools',
            competitorDomain: 'ahrefs.com',
            competitorRank: 1,
            ourRank: 7,
            gap: 6,
          },
          {
            keyword: 'keyword research',
            competitorDomain: 'semrush.com',
            competitorRank: 2,
            ourRank: 8,
            gap: 6,
          },
          {
            keyword: 'competitor analysis',
            competitorDomain: 'moz.com',
            competitorRank: 4,
            ourRank: 12,
            gap: 8,
          },
        ],
        summary: {
          totalKeywordsOutranked: 3,
          avgGap: 6.67,
          topCompetitor: 'ahrefs.com',
        },
      };
    }

    if (sourceName.includes('Domain Authority')) {
      return {
        competitors: [
          {
            domain: 'ahrefs.com',
            authorityScore: 92,
            totalKeywords: 42000,
            commonKeywords: 420,
          },
          {
            domain: 'semrush.com',
            authorityScore: 91,
            totalKeywords: 38000,
            commonKeywords: 315,
          },
          {
            domain: 'moz.com',
            authorityScore: 88,
            totalKeywords: 28000,
            commonKeywords: 280,
          },
        ],
        ourDomain: {
          domain: 'riviso.com',
          authorityScore: 58,
          totalKeywords: 150,
        },
      };
    }

    if (sourceName.includes('Content Gap')) {
      return {
        opportunities: [
          {
            keyword: 'backlink analysis',
            searchVolume: 5400,
            competitorsRanking: ['ahrefs.com', 'semrush.com', 'moz.com'],
            difficulty: 68,
          },
          {
            keyword: 'seo reporting',
            searchVolume: 3200,
            competitorsRanking: ['semrush.com', 'moz.com'],
            difficulty: 52,
          },
        ],
      };
    }

    return {};
  }
}
