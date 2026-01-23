/**
 * Competitor Analysis types
 */

export interface Competitor {
  id: string;
  projectId: string;
  domain: string;
  name: string;
  tracked: boolean;
  metrics: CompetitorMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorMetrics {
  estimatedTraffic: number;
  totalKeywords: number;
  commonKeywords: number;
  averageRank: number;
  backlinks: number;
  domainAuthority: number;
  lastUpdated: string;
}

export interface CompetitorComparison {
  projectDomain: string;
  competitors: CompetitorOverview[];
  keywordOverlap: KeywordOverlap[];
  contentGaps: ContentGap[];
  strengthsWeaknesses: StrengthWeaknessAnalysis;
}

export interface CompetitorOverview {
  domain: string;
  name: string;
  metrics: CompetitorMetrics;
  rankDistribution: RankDistribution;
}

export interface RankDistribution {
  top3: number;
  top10: number;
  top20: number;
  top50: number;
  top100: number;
}

export interface KeywordOverlap {
  keyword: string;
  projectRank: number;
  competitors: {
    domain: string;
    rank: number;
  }[];
  searchVolume: number;
}

export interface ContentGap {
  keyword: string;
  missingFrom: string; // project domain
  competitorRanks: {
    domain: string;
    rank: number;
    url: string;
  }[];
  opportunity: number;
}

export interface StrengthWeaknessAnalysis {
  projectStrengths: string[];
  projectWeaknesses: string[];
  competitorStrengths: { [domain: string]: string[] };
  recommendations: string[];
}
