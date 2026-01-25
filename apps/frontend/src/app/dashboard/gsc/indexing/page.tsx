'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Database, CheckCircle, XCircle } from 'lucide-react';

interface IndexingData {
  sitemaps: Array<{ path: string; contents: any[]; errors: any[] }>;
  indexedPages: number;
  notIndexedPages: number;
  errors: Array<{ url: string; reason: string }>;
}

function IndexingPageContent() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<IndexingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!selectedWebsite?.url) {
      setError('Please select a website');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: responseData } = await api.get<IndexingData>('/v1/search-console/indexing', {
        params: {
          websiteId: selectedWebsite.url,
        },
      });

      setData(responseData);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch indexing data');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indexing & Coverage</h1>
          <p className="text-gray-600 mt-1">Monitor how Google indexes your website</p>
        </div>

        <GscTabs />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Indexed Pages</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{data.indexedPages.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Not Indexed</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{data.notIndexedPages.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Sitemaps</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{data.sitemaps.length}</div>
              </div>
            </div>

            {data.sitemaps.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sitemaps</h3>
                <div className="space-y-2">
                  {data.sitemaps.map((sitemap, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-900">{sitemap.path}</div>
                      {sitemap.errors && sitemap.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {sitemap.errors.length} error(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.errors.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Indexing Errors
                </h3>
                <div className="space-y-2">
                  {data.errors.map((error, idx) => (
                    <div key={idx} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="font-medium text-red-900">{error.url}</div>
                      <div className="text-sm text-red-700 mt-1">{error.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No indexing data available</p>
            <p className="text-sm text-gray-500 mt-2">Indexing data will be available after Google crawls your site</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function IndexingPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <IndexingPageContent />
    </Suspense>
  );
}
