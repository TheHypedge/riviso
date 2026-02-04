'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import {
  Loader,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  MousePointer,
  Eye,
  BarChart3,
  Globe,
  FileText,
  Search,
  Image as ImageIcon,
} from 'lucide-react';

type Tab = 'top' | 'trendingUp' | 'trendingDown';

interface InsightRow {
  key: string;
  clicks: number;
  impressions: number;
  change?: string;
}

interface InsightsPayload {
  startDate: string;
  endDate: string;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  yourContent: { top: InsightRow[]; trendingUp: (InsightRow & { change: string })[]; trendingDown: (InsightRow & { change: string })[] };
  queries: { top: InsightRow[]; trendingUp: (InsightRow & { change: string })[]; trendingDown: (InsightRow & { change: string })[] };
  topCountries: Array<{ country: string; countryName: string; clicks: number; impressions: number }>;
  additionalTrafficSources: Array<{ source: string; clicks: number; impressions: number }>;
}

export default function InsightsPage() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentTab, setContentTab] = useState<Tab>('top');
  const [queriesTab, setQueriesTab] = useState<Tab>('top');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });
  const [requestedRange, setRequestedRange] = useState<{ start: Date; end: Date } | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedWebsite?.url) {
      setError('Please select a website');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];
      const { data: res } = await api.get<InsightsPayload>('/v1/search-console/insights', {
        params: { websiteId: selectedWebsite.url, startDate, endDate },
      });
      setData(res);
      setRequestedRange({ start: new Date(res.startDate), end: new Date(res.endDate) });
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load insights';
      setError(errorMessage);
      setData(null);
      console.error('Failed to load GSC insights:', errorMessage, e);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite?.url, dateRange]);

  useEffect(() => {
    if (selectedWebsite?.url) fetchData();
  }, [selectedWebsite?.url, dateRange, fetchData]);

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setRequestedRange(null);
    setData(null);
  };

  const tabList: { id: Tab; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'trendingUp', label: 'Trending up' },
    { id: 'trendingDown', label: 'Trending down' },
  ];

  const renderTabbedSection = (
    title: string,
    icon: React.ReactNode,
    activeTab: Tab,
    onTab: (t: Tab) => void,
    top: InsightRow[],
    trendingUp: (InsightRow & { change: string })[],
    trendingDown: (InsightRow & { change: string })[],
    keyLabel: string,
    viewMoreHref?: string,
  ) => {
    const list = activeTab === 'top' ? top : activeTab === 'trendingUp' ? trendingUp : trendingDown;
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">Data from Google Search Console</p>
        <div className="flex gap-2 mb-4">
          {tabList.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === t.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-sm text-gray-500">No data for this tab.</p>
          ) : (
            list.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-2">
                <span className="text-sm font-medium text-gray-900 truncate flex-1" title={item.key}>
                  {keyLabel === 'page' ? (item.key.replace(/^https?:\/\//, '').replace(/\/$/, '') || item.key) : item.key}
                </span>
                <span className="text-sm text-gray-500 tabular-nums shrink-0">
                  {'change' in item && item.change ? `${item.change} ${item.clicks}` : `${item.clicks} clicks`}
                </span>
              </div>
            ))
          )}
        </div>
        {viewMoreHref && (
          <Link href={viewMoreHref} className="inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
            View more →
          </Link>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Insights
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Your content, queries, top countries, and additional traffic sources. Data from Google Search Console.
            </p>
          </div>
          <Link
            href="/dashboard/gsc/performance"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Search Results
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <GscDateRangeSelector
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={handleDateChange}
          onRefresh={fetchData}
          loading={loading}
          requestedRange={requestedRange}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MousePointer className="w-4 h-4" />
                  <span className="text-xs font-medium">Total clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{data.totalClicks.toLocaleString()}</div>
                {requestedRange && (
                  <div className="text-xs text-gray-500 mt-1">
                    {requestedRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {requestedRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">Total impressions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{data.totalImpressions.toLocaleString()}</div>
                {requestedRange && (
                  <div className="text-xs text-gray-500 mt-1">
                    {requestedRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {requestedRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Average CTR</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{data.averageCtr.toFixed(2)}%</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500 mb-1">Average position</div>
                <div className="text-2xl font-bold text-gray-900">{data.averagePosition.toFixed(1)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderTabbedSection(
                'Your content',
                <FileText className="w-4 h-4 text-blue-600" />,
                contentTab,
                setContentTab,
                data.yourContent.top,
                data.yourContent.trendingUp,
                data.yourContent.trendingDown,
                'page',
                '/dashboard/gsc/performance',
              )}
              {renderTabbedSection(
                'Queries leading to your site',
                <Search className="w-4 h-4 text-emerald-600" />,
                queriesTab,
                setQueriesTab,
                data.queries.top,
                data.queries.trendingUp,
                data.queries.trendingDown,
                'query',
                '/dashboard/gsc/performance',
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-600" />
                  Top countries
                </h3>
                <p className="text-xs text-gray-500 mb-3">Data from Google Search Console</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {data.topCountries.length === 0 ? (
                    <p className="text-sm text-gray-500">No country data for this range.</p>
                  ) : (
                    data.topCountries.slice(0, 15).map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium text-gray-900">{c.countryName || c.country}</span>
                        <span className="text-sm text-gray-500 tabular-nums">{c.clicks} clicks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  Additional traffic sources
                </h3>
                <p className="text-xs text-gray-500 mb-3">Data from Google Search Console</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {data.additionalTrafficSources.length === 0 ? (
                    <p className="text-sm text-gray-500">No traffic source data for this range.</p>
                  ) : (
                    data.additionalTrafficSources.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium text-gray-900">{s.source}</span>
                        <span className="text-sm text-gray-500 tabular-nums">{s.clicks} clicks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!data && !loading && !error && selectedWebsite?.url && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
            <Lightbulb className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No insights yet</p>
            <p className="text-sm text-gray-500 mt-2">Click &quot;Refresh Data&quot; to load Google Search Console insights.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
