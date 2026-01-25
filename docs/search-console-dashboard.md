# Search Console Dashboard Module

## Overview

The Search Console Dashboard module provides a comprehensive interface for analyzing Google Search Console data within the Riviso platform. It consists of 10 specialized views, each focusing on different aspects of search performance, indexing, and site health.

## Architecture

### Backend Structure

**Module**: `apps/backend/src/modules/search-console/`

- **Controller**: `search-console.controller.ts`
  - Handles all API endpoints for Search Console data
  - Routes: `/v1/search-console/*`
  - All endpoints require JWT authentication

- **Service**: `search-console.service.ts`
  - Maps website URLs to GSC properties automatically
  - Fetches data from Google Search Console API
  - Aggregates and processes data for frontend consumption
  - Handles token refresh automatically

- **DTO**: `dto/gsc-query.dto.ts`
  - Validates query parameters
  - Supports filtering by date range, dimensions, queries, pages, countries, devices, etc.

### Frontend Structure

**Base Route**: `/dashboard/gsc/*`

**Pages**:
1. `/dashboard/gsc/performance` - Search Performance (default view)
2. `/dashboard/gsc/pages` - Top Pages
3. `/dashboard/gsc/queries` - Queries (Keywords)
4. `/dashboard/gsc/devices` - Device Breakdown
5. `/dashboard/gsc/countries` - Country Breakdown
6. `/dashboard/gsc/appearance` - Search Appearance
7. `/dashboard/gsc/indexing` - Indexing & Coverage
8. `/dashboard/gsc/experience` - Core Web Vitals
9. `/dashboard/gsc/internal-links` - Internal Links
10. `/dashboard/gsc/security` - Security & Manual Actions

**Shared Components**:
- `GscTabs` - Navigation tabs between sections
- `GscDateRangeSelector` - Date range picker with presets
- `GscKpiCards` - KPI metric cards (Clicks, Impressions, CTR, Position)

## Data Flow

### 1. Website Selection
- User selects a website from the global website selector
- Frontend passes `websiteId` (website URL) to backend

### 2. Property Mapping
- Backend `SearchConsoleService.getMappedProperty()`:
  - Retrieves user's GSC connection
  - Gets all available GSC properties
  - Matches website URL to GSC property (supports `sc-domain:` and `http/https` formats)
  - Returns the matched property URL

### 3. Data Fetching
- Backend makes authenticated requests to Google Search Console API
- Uses `searchanalytics.query` endpoint with appropriate dimensions
- Aggregates data for accurate totals and breakdowns

### 4. Data Display
- Frontend receives processed data
- Renders charts, tables, and metrics
- Supports filtering, sorting, and pagination

## API Endpoints

### Performance Data
```
GET /v1/search-console/performance
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
  - dimensions: string[] (optional)
```

### Top Pages
```
GET /v1/search-console/pages
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
  - rowLimit: number (optional, default: 100)
```

### Top Queries
```
GET /v1/search-console/queries
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
  - minPosition: number (optional)
  - maxPosition: number (optional)
  - minCtr: number (optional)
  - minImpressions: number (optional)
  - queryFilter: string (optional)
  - rowLimit: number (optional, default: 100)
```

### Devices
```
GET /v1/search-console/devices
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
```

### Countries
```
GET /v1/search-console/countries
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
```

### Search Appearance
```
GET /v1/search-console/appearance
Query Params:
  - websiteId: string (required)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
```

### Indexing
```
GET /v1/search-console/indexing
Query Params:
  - websiteId: string (required)
```

### Core Web Vitals
```
GET /v1/search-console/experience
Query Params:
  - websiteId: string (required)
```

### Security
```
GET /v1/search-console/security
Query Params:
  - websiteId: string (required)
```

### Internal Links
```
GET /v1/search-console/internal-links
Query Params:
  - websiteId: string (required)
```

## Key Features

### 1. Automatic Property Mapping
- Automatically matches Riviso website to GSC property
- Supports domain properties (`sc-domain:example.com`)
- Supports URL prefix properties (`https://example.com/`)
- Falls back to first available property if no exact match

### 2. Date Range Management
- Default: Last 28 days
- Quick presets: 24h, 7d, 28d, 3m, 6m, 12m
- Custom date picker
- Manual refresh required (no auto-fetch on date change)

### 3. Dynamic Chart Scaling
- X-axis labels adjust based on date range
- Angle and interval optimized for readability
- Supports ranges from 1 day to 12+ months

### 4. Data Aggregation
- Separate API calls for accurate totals (DATE dimension)
- Breakdowns by query, page, device, country, etc.
- Weighted average position calculation
- Missing dates filled with zeros

### 5. Filtering & Sorting
- Query filters (position range, CTR threshold, impressions)
- Sortable table columns
- Pagination support
- Row highlighting for anomalies

## Security

- All endpoints require JWT authentication
- Only fetches data for mapped website property
- Never exposes other GSC properties
- Automatic token refresh
- Rate-limited API calls

## Future Enhancements

1. **Caching**: Daily cache of GSC data to reduce API calls
2. **Background Sync**: Scheduled jobs to sync data automatically
3. **AI Insights**: Automated analysis and recommendations
4. **Alerts**: Notifications for significant changes
5. **Export**: CSV/PDF export of reports
6. **Comparisons**: Compare performance across date ranges

## Dependencies

- **Backend**: 
  - `@nestjs/common`, `@nestjs/config`
  - `axios` for HTTP requests
  - `IntegrationsModule` for GSC connection management

- **Frontend**:
  - `next/navigation` for routing
  - `recharts` for data visualization
  - `lucide-react` for icons
  - `@riviso/shared-types` for type definitions

## Error Handling

- Graceful fallback when GSC not connected
- Clear error messages for API failures
- Empty states with helpful guidance
- Loading states during data fetch
- Retry mechanisms for transient failures
