'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface PageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function PagesPageContent() {
  const { selectedWebsite } = useWebsite();
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof PageData>('clicks');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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

      const { data } = await api.get<PageData[]>('/v1/search-console/pages', {
        params: {
          websiteId: selectedWebsite.url,
          startDate,
          endDate,
        },
      });

      setPages(data);
      setRequestedRange({ start: dateRange.start, end: dateRange.end });
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to fetch pages data';
      setError(errorMessage);
      setPages([]);
      console.error('Failed to fetch GSC pages data:', errorMessage, e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.url) {
      fetchData();
    }
  }, [selectedWebsite?.url, dateRange]);

  const handleSort = (field: keyof PageData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPages = [...pages].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const getRowHighlight = (page: PageData) => {
    // High impressions, low CTR
    if (page.impressions > 1000 && page.ctr < 1) {
      return 'bg-yellow-50';
    }
    // High position drop (position > 20)
    if (page.position > 20) {
      return 'bg-red-50';
    }
    return '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Pages</h1>
          <p className="text-gray-600 mt-1">Analyze which pages perform best in search results</p>
        </div>

        <GscTabs />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3 text-red-800">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">{error}</p>
                {error.includes('not connected') || error.includes('Google Search Console') ? (
                  <p className="text-sm text-red-700 mt-2">
                    Please connect Google Search Console in{' '}
                    <a href="/dashboard/settings" className="underline font-medium hover:text-red-900">
                      Settings → Integrations
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <GscDateRangeSelector
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={(start, end) => {
            setDateRange({ start, end });
            setPages([]);
          }}
          onRefresh={fetchData}
          loading={loading}
          requestedRange={requestedRange}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {pages.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('page')}
                    >
                      <div className="flex items-center gap-2">
                        Page
                        {sortField === 'page' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('clicks')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Clicks
                        {sortField === 'clicks' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('impressions')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Impressions
                        {sortField === 'impressions' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ctr')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        CTR
                        {sortField === 'ctr' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Position
                        {sortField === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPages.map((page, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50 ${getRowHighlight(page)}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-md">{page.page}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{page.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{page.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {page.ctr.toFixed(2)}%
                          {page.impressions > 1000 && page.ctr < 1 && (
                            <TrendingDown className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {page.position.toFixed(1)}
                          {page.position > 20 && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pages.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No page data available</p>
            <p className="text-sm text-gray-500 mt-2">Click "Refresh Data" to fetch page performance data</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PagesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <PagesPageContent />
    </Suspense>
  );
}
