/**
 * Common types used across the platform
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum DataSource {
  GOOGLE_ANALYTICS = 'google_analytics',
  GOOGLE_SEARCH_CONSOLE = 'google_search_console',
  INTERNAL = 'internal',
  THIRD_PARTY_API = 'third_party_api',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}
