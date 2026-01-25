'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Search, Filter } from 'lucide-react';

interface QueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function QueriesPageContent() {
  const { selectedWebsite } = useWebsite();
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPosition: '',
    maxPosition: '',
    minCtr: '',
    minImpressions: '',
    querySearch: '',
  });
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });
  const [requestedRange, setRequestedRange] = useState<{ start: Date; end: Date } | null>(null);

  const fetchData = async () => {
    if (!selectedWebsite?.url) {
      setError('Please select a website');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];

      const params: any = {
        websiteId: selectedWebsite.url,
        startDate,
        endDate,
      };

      if (filters.minPosition) params.minPosition = parseInt(filters.minPosition);
      if (filters.maxPosition) params.maxPosition = parseInt(filters.maxPosition);
      if (filters.minCtr) params.minCtr = parseFloat(filters.minCtr);
      if (filters.minImpressions) params.minImpressions = parseInt(filters.minImpressions);
      if (filters.querySearch) params.queryFilter = filters.querySearch;

      const { data } = await api.get<QueryData[]>('/v1/search-console/queries', { params });

      setQueries(data);
      setRequestedRange({ start: dateRange.start, end: dateRange.end });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch queries data');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.url) {
      fetchData();
    }
  }, [selectedWebsite?.url]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queries (Keywords)</h1>
          <p className="text-gray-600 mt-1">Discover which search queries drive traffic to your site</p>
        </div>

        <GscTabs />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <GscDateRangeSelector
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={(start, end) => {
            setDateRange({ start, end });
            setQueries([]);
          }}
          onRefresh={fetchData}
          loading={loading}
          requestedRange={requestedRange}
        />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Min Position</label>
              <input
                type="number"
                value={filters.minPosition}
                onChange={(e) => handleFilterChange('minPosition', e.target.value)}
                placeholder="1"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Max Position</label>
              <input
                type="number"
                value={filters.maxPosition}
                onChange={(e) => handleFilterChange('maxPosition', e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Min CTR (%)</label>
              <input
                type="number"
                step="0.1"
                value={filters.minCtr}
                onChange={(e) => handleFilterChange('minCtr', e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Min Impressions</label>
              <input
                type="number"
                value={filters.minImpressions}
                onChange={(e) => handleFilterChange('minImpressions', e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Search Query</label>
              <input
                type="text"
                value={filters.querySearch}
                onChange={(e) => handleFilterChange('querySearch', e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <button
            onClick={applyFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Apply Filters
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {queries.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queries.map((query, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{query.query}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{query.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{query.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{query.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{query.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {queries.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No query data available</p>
            <p className="text-sm text-gray-500 mt-2">Click "Refresh Data" to fetch query performance data</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function QueriesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <QueriesPageContent />
    </Suspense>
  );
}
