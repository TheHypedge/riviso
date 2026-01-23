import { IsUrl, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum GSCDimension {
  DATE = 'date',
  QUERY = 'query',
  PAGE = 'page',
  COUNTRY = 'country',
  DEVICE = 'device',
}

export enum GSCSearchType {
  WEB = 'web',
  IMAGE = 'image',
  VIDEO = 'video',
}

export class ConnectGSCDto {
  @IsUrl()
  siteUrl: string;

  authorizationCode?: string;
}

export class GSCQueryDto {
  @IsUrl()
  siteUrl: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(GSCDimension, { each: true })
  dimensions?: GSCDimension[];

  @IsOptional()
  @IsEnum(GSCSearchType)
  searchType?: GSCSearchType;

  @IsOptional()
  rowLimit?: number;
}

export interface GSCMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCResponse {
  rows: GSCRow[];
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
}

export interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface GSCIntegration {
  id: string;
  userId: string;
  siteUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  connectedAt: Date;
  lastSyncAt?: Date;
}
