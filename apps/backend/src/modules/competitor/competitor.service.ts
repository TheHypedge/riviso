import { Injectable } from '@nestjs/common';
import {
  Competitor,
  CompetitorComparison,
  ContentGap,
} from '@riviso/shared-types';

@Injectable()
export class CompetitorService {
  async addCompetitor(domain: string, projectId: string): Promise<Competitor> {
    // Mock implementation
    return {
      id: `comp-${Date.now()}`,
      projectId,
      domain,
      name: domain.replace(/\.(com|net|org)$/, ''),
      tracked: true,
      metrics: {
        estimatedTraffic: Math.floor(Math.random() * 100000),
        totalKeywords: Math.floor(Math.random() * 5000),
        commonKeywords: Math.floor(Math.random() * 500),
        averageRank: Math.floor(Math.random() * 30) + 10,
        backlinks: Math.floor(Math.random() * 10000),
        domainAuthority: Math.floor(Math.random() * 40) + 40,
        lastUpdated: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getCompetitors(projectId: string): Promise<Competitor[]> {
    return [
      await this.addCompetitor('competitor1.com', projectId),
      await this.addCompetitor('competitor2.com', projectId),
    ];
  }

  async getComparison(projectId: string): Promise<CompetitorComparison> {
    // Mock implementation
    return {
      projectDomain: 'example.com',
      competitors: [
        {
          domain: 'competitor1.com',
          name: 'Competitor 1',
          metrics: {
            estimatedTraffic: 85000,
            totalKeywords: 3200,
            commonKeywords: 420,
            averageRank: 15,
            backlinks: 8500,
            domainAuthority: 68,
            lastUpdated: new Date().toISOString(),
          },
          rankDistribution: {
            top3: 120,
            top10: 450,
            top20: 820,
            top50: 1500,
            top100: 2400,
          },
        },
      ],
      keywordOverlap: [
        {
          keyword: 'seo tools',
          projectRank: 12,
          competitors: [
            { domain: 'competitor1.com', rank: 3 },
            { domain: 'competitor2.com', rank: 8 },
          ],
          searchVolume: 8100,
        },
      ],
      contentGaps: [],
      strengthsWeaknesses: {
        projectStrengths: [
          'Strong technical SEO',
          'Fast page speed',
          'Good mobile experience',
        ],
        projectWeaknesses: [
          'Lower backlink count',
          'Less content depth',
          'Fewer ranking keywords',
        ],
        competitorStrengths: {
          'competitor1.com': ['High domain authority', 'More backlinks'],
        },
        recommendations: [
          'Focus on building quality backlinks',
          'Create more in-depth content',
          'Target competitor keyword gaps',
        ],
      },
    };
  }

  async getContentGaps(projectId: string): Promise<ContentGap[]> {
    // Mock implementation
    return [
      {
        keyword: 'advanced seo techniques',
        missingFrom: 'example.com',
        competitorRanks: [
          {
            domain: 'competitor1.com',
            rank: 2,
            url: 'https://competitor1.com/advanced-seo',
          },
          {
            domain: 'competitor2.com',
            rank: 5,
            url: 'https://competitor2.com/seo-guide',
          },
        ],
        opportunity: 85,
      },
    ];
  }
}
