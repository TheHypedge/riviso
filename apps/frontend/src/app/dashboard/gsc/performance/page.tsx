'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { GscKpiCards } from '@/components/search-console/GscKpiCards';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Search } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceData {
  siteUrl: string;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  dailyPerformance: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  startDate: string;
  endDate: string;
}

function PerformancePageContent() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<PerformanceData | null>(null);
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

      const { data: responseData } = await api.get<PerformanceData>('/v1/search-console/performance', {
        params: {
          websiteId: selectedWebsite.url,
          startDate,
          endDate,
          dimensions: ['date', 'query'],
        },
      });

      setData(responseData);
      setRequestedRange({
        start: new Date(responseData.startDate),
        end: new Date(responseData.endDate),
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch performance data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.url) {
      fetchData();
    }
  }, [selectedWebsite?.url]);

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setData(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Dynamic chart config
  const getChartConfig = () => {
    if (!data?.dailyPerformance.length) return null;
    const daysCount = data.dailyPerformance.length;
    
    if (daysCount <= 7) {
      return { angle: 0, textAnchor: 'middle' as const, height: 40, interval: 0, marginBottom: 40 };
    } else if (daysCount <= 30) {
      return { angle: -45, textAnchor: 'end' as const, height: 60, interval: 0, marginBottom: 60 };
    } else if (daysCount <= 90) {
      const interval = Math.max(1, Math.floor(daysCount / 20));
      return { angle: -45, textAnchor: 'end' as const, height: 80, interval, marginBottom: 80 };
    } else {
      const interval = Math.max(1, Math.floor(daysCount / 12));
      return { angle: -45, textAnchor: 'end' as const, height: 80, interval, marginBottom: 80 };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Performance</h1>
          <p className="text-gray-600 mt-1">Analyze your search performance metrics and trends</p>
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
          onDateChange={handleDateChange}
          onRefresh={handleRefresh}
          loading={loading}
          requestedRange={requestedRange}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {data && !loading && (
          <>
            <GscKpiCards
              clicks={data.totalClicks}
              impressions={data.totalImpressions}
              ctr={data.averageCtr}
              position={data.averagePosition}
              dateRange={requestedRange}
            />

            {data.dailyPerformance.length > 0 && chartConfig && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={data.dailyPerformance} margin={{ top: 5, right: 30, left: 20, bottom: chartConfig.marginBottom }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        if (data.dailyPerformance.length <= 7) {
                          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        } else if (data.dailyPerformance.length <= 30) {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } else {
                          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        }
                      }}
                      angle={chartConfig.angle}
                      textAnchor={chartConfig.textAnchor}
                      height={chartConfig.height}
                      interval={chartConfig.interval}
                      minTickGap={data.dailyPerformance.length > 90 ? 30 : 10}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      formatter={(value: number, name: string) => {
                        if (name === 'ctr') return `${value.toFixed(2)}%`;
                        if (name === 'position') return value.toFixed(1);
                        return value.toLocaleString();
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Clicks" dot={{ r: 3 }} />
                    <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} name="Impressions" dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="position" stroke="#f59e0b" strokeWidth={2} name="Position" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.topQueries.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Top Queries
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topQueries.slice(0, 20).map((query, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{query.query}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{query.clicks.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{query.impressions.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{query.ctr.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{query.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PerformancePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <PerformancePageContent />
    </Suspense>
  );
}
