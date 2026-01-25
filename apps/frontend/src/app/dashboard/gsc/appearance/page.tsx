'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Image } from 'lucide-react';

interface AppearanceData {
  appearance: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function AppearancePageContent() {
  const { selectedWebsite } = useWebsite();
  const [appearances, setAppearances] = useState<AppearanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      const { data } = await api.get<AppearanceData[]>('/v1/search-console/appearance', {
        params: {
          websiteId: selectedWebsite.url,
          startDate,
          endDate,
        },
      });

      setAppearances(data);
      setRequestedRange({ start: dateRange.start, end: dateRange.end });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch search appearance data');
      setAppearances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.url) {
      fetchData();
    }
  }, [selectedWebsite?.url]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Appearance</h1>
          <p className="text-gray-600 mt-1">Analyze how your site appears in search results (Rich Results, AMP, etc.)</p>
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
            setAppearances([]);
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

        {appearances.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Appearance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appearances.map((appearance, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{appearance.appearance}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{appearance.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{appearance.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{appearance.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{appearance.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {appearances.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No search appearance data available</p>
            <p className="text-sm text-gray-500 mt-2">Click "Refresh Data" to fetch search appearance data</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AppearancePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <AppearancePageContent />
    </Suspense>
  );
}
