import { Status } from './common';

/**
 * Project/Website types
 */

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  domain: string;
  status: Status;
  integrations: ProjectIntegrations;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  domain: string;
  workspaceId: string;
}

export interface ProjectIntegrations {
  googleAnalytics?: {
    enabled: boolean;
    propertyId?: string;
    lastSyncAt?: string;
  };
  googleSearchConsole?: {
    enabled: boolean;
    siteUrl?: string;
    lastSyncAt?: string;
  };
}

export interface ProjectMetadata {
  industry?: string;
  targetCountry?: string;
  targetLanguage?: string;
  competitors?: string[];
}

export interface ProjectStats {
  totalKeywords: number;
  averageRank: number;
  organicTraffic: number;
  conversions: number;
  lastUpdated: string;
}
