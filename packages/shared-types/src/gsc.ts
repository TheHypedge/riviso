/**
 * Google Search Console Types
 */

export enum GscDimension {
  DATE = 'date',
  QUERY = 'query',
  PAGE = 'page',
  COUNTRY = 'country',
  DEVICE = 'device',
  SEARCH_APPEARANCE = 'searchAppearance',
}

export interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface GscDailyPerformance {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscCountry {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDevice {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPerformanceData {
  siteUrl: string;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  dailyPerformance: GscDailyPerformance[];
  topQueries: GscQuery[];
  topPages: GscPage[];
  topCountries: GscCountry[];
  topDevices: GscDevice[];
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export interface GscDataQueryDto {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: GscDimension[];
  queryFilter?: string;
  pageFilter?: string;
}
