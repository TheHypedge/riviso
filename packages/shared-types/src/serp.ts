/**
 * SERP (Search Engine Results Page) & Keyword Tracking types
 */

export interface Keyword {
  id: string;
  projectId: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: KeywordIntent;
  tags: string[];
  tracked: boolean;
  createdAt: string;
}

export enum KeywordIntent {
  INFORMATIONAL = 'informational',
  NAVIGATIONAL = 'navigational',
  COMMERCIAL = 'commercial',
  TRANSACTIONAL = 'transactional',
}

export interface KeywordRanking {
  id: string;
  keywordId: string;
  projectId: string;
  rank: number;
  url: string;
  previousRank?: number;
  searchEngine: SearchEngine;
  location: string;
  device: DeviceType;
  checkedAt: string;
}

export enum SearchEngine {
  GOOGLE = 'google',
  BING = 'bing',
  YAHOO = 'yahoo',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

export interface SerpFeature {
  type: SerpFeatureType;
  position: number;
  present: boolean;
}

export enum SerpFeatureType {
  FEATURED_SNIPPET = 'featured_snippet',
  PEOPLE_ALSO_ASK = 'people_also_ask',
  LOCAL_PACK = 'local_pack',
  IMAGE_PACK = 'image_pack',
  VIDEO_CAROUSEL = 'video_carousel',
  KNOWLEDGE_PANEL = 'knowledge_panel',
  SHOPPING_RESULTS = 'shopping_results',
}

export interface KeywordAnalysis {
  keyword: string;
  currentRank: number;
  rankChange: number;
  topCompetitors: CompetitorRanking[];
  serpFeatures: SerpFeature[];
  opportunity: OpportunityScore;
}

export interface CompetitorRanking {
  domain: string;
  rank: number;
  url: string;
  title: string;
  snippet: string;
}

export interface OpportunityScore {
  score: number;
  reasoning: string;
  factors: {
    searchVolume: number;
    difficulty: number;
    currentRank: number;
    trend: number;
  };
}
