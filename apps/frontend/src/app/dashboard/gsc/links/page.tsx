'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import {
  Loader,
  AlertCircle,
  Link as LinkIcon,
  FileX,
  ExternalLink,
  Globe,
  Type,
  RefreshCw,
  Info,
} from 'lucide-react';
import { LinksErrorBoundary } from './LinksErrorBoundary';

interface LinksData {
  internal: {
    total: number;
    topLinkedPages: Array<{ url: string; inboundLinks: number }>;
    orphanPages: Array<{ url: string }>;
  };
  external: {
    total: number;
    topLinkedPages: Array<{ url: string; inboundLinks: number }>;
    topLinkingSites: Array<{ site: string; links: number }>;
    topLinkingText: Array<{ text: string; links: number }>;
  };
}

const EMPTY_LINKS: LinksData = {
  internal: { total: 0, topLinkedPages: [], orphanPages: [] },
  external: { total: 0, topLinkedPages: [], topLinkingSites: [], topLinkingText: [] },
};

function normalizeLinksResponse(res: unknown): LinksData {
  if (!res || typeof res !== 'object') return EMPTY_LINKS;
  const o = res as Record<string, unknown>;
  const internal = o.internal as Record<string, unknown> | undefined;
  const external = o.external as Record<string, unknown> | undefined;
  return {
    internal: {
      total: typeof internal?.total === 'number' ? internal.total : 0,
      topLinkedPages: Array.isArray(internal?.topLinkedPages) ? internal.topLinkedPages : [],
      orphanPages: Array.isArray(internal?.orphanPages) ? internal.orphanPages : [],
    },
    external: {
      total: typeof external?.total === 'number' ? external.total : 0,
      topLinkedPages: Array.isArray(external?.topLinkedPages) ? external.topLinkedPages : [],
      topLinkingSites: Array.isArray(external?.topLinkingSites) ? external.topLinkingSites : [],
      topLinkingText: Array.isArray(external?.topLinkingText) ? external.topLinkingText : [],
    },
  };
}

/** Build GSC Links report URL for domain (sc-domain). GSC Links report is not available via API. */
function gscLinksReportUrl(websiteUrl: string): string {
  try {
    const raw = (websiteUrl || '').trim();
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(href);
    const domain = u.hostname.replace(/^www\./, '');
    return `https://search.google.com/search-console/links?resource_id=${encodeURIComponent('sc-domain:' + domain)}`;
  } catch {
    return 'https://search.google.com/search-console';
  }
}

function LinksPageContent() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<LinksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const url = selectedWebsite?.url;
    if (!url || typeof url !== 'string' || !url.trim()) {
      setError('Please select a website');
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<unknown>('/v1/search-console/links', {
        params: { websiteId: url.trim() },
      });
      setData(normalizeLinksResponse(res));
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(msg && typeof msg === 'string' ? msg : 'Failed to fetch links data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite?.url]);

  useEffect(() => {
    if (!selectedWebsite?.url) {
      setError(null);
      setData(null);
      return;
    }
    fetchData();
  }, [selectedWebsite?.url, fetchData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-primary-600" />
              Links
            </h1>
            <p className="text-gray-600 mt-1">
              Internal links, external links, top linking sites, and top linking text. Matches Google Search Console structure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedWebsite?.url && typeof selectedWebsite.url === 'string' && (
              <a
                href={gscLinksReportUrl(selectedWebsite.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View in Google Search Console
              </a>
            )}
            <button
              type="button"
              onClick={fetchData}
              disabled={!selectedWebsite?.url || loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh data
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Links report &amp; Google Search Console</p>
            <p className="text-blue-800">
              The full Links report (external/internal, top linking sites, top linking text) is <strong>not available via the GSC API</strong>—only in the Search Console web UI. Use <strong>View in Google Search Console</strong> above for the full report. Here we show GSC-style link data from <strong>website analysis</strong> (scraped from the selected site) so you can see a breakdown in-app without leaving Riviso.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Internal links */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Internal links
              </h3>
              <p className="text-sm text-gray-500 mb-4">Total {data?.internal?.total ?? 0}</p>
              {((data?.internal?.topLinkedPages) ?? []).length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(data?.internal?.topLinkedPages ?? []).map((p, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-gray-100 gap-2">
                      <span className="text-sm text-gray-900 truncate flex-1">{p?.url ?? ''}</span>
                      <span className="text-sm text-gray-500 tabular-nums shrink-0">{p?.inboundLinks ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No internal links found on the analyzed page. Use Refresh data to re-scrape.</p>
              )}
              {((data?.internal?.orphanPages) ?? []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <FileX className="w-4 h-4" />
                    Orphan pages
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(data?.internal?.orphanPages ?? []).map((p, i) => (
                      <div key={i} className="text-sm text-gray-600 truncate">{p?.url ?? ''}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* External links */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-emerald-600" />
                External links
              </h3>
              <p className="text-sm text-gray-500 mb-4">Total {data?.external?.total ?? 0}</p>
              {((data?.external?.topLinkedPages) ?? []).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(data?.external?.topLinkedPages ?? []).map((p, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-gray-100 gap-2">
                      <span className="text-sm text-gray-900 truncate flex-1">{p?.url ?? ''}</span>
                      <span className="text-sm text-gray-500 tabular-nums shrink-0">{p?.inboundLinks ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No external links found on the analyzed page. Use Refresh data to re-scrape.</p>
              )}
            </div>

            {/* Top linking sites */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-600" />
                Top linking sites
              </h3>
              {((data?.external?.topLinkingSites) ?? []).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(data?.external?.topLinkingSites ?? []).map((s, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-900 truncate flex-1">{s?.site ?? ''}</span>
                      <span className="text-sm text-gray-500 tabular-nums">{s?.links ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data yet. Use Refresh data to fetch from website analysis.</p>
              )}
            </div>

            {/* Top linking text */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-600" />
                Top linking text
              </h3>
              {((data?.external?.topLinkingText) ?? []).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(data?.external?.topLinkingText ?? []).map((t, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-900 truncate flex-1">{t?.text ?? '(empty)'}</span>
                      <span className="text-sm text-gray-500 tabular-nums">{t?.links ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data yet. Use Refresh data to fetch from website analysis.</p>
              )}
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No links data</p>
            <p className="text-sm text-gray-500 mt-2">Select a website and refresh to load links.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function LinksPage() {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <LinksErrorBoundary onRetry={() => setRetryKey((k) => k + 1)}>
      <Suspense
        key={retryKey}
        fallback={
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <Loader className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
          </DashboardLayout>
        }
      >
        <LinksPageContent />
      </Suspense>
    </LinksErrorBoundary>
  );
}
