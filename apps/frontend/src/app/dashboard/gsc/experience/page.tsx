'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface CoreWebVitalsData {
  desktop: {
    lcp: { good: number; needsImprovement: number; poor: number };
    fid: { good: number; needsImprovement: number; poor: number };
    cls: { good: number; needsImprovement: number; poor: number };
  };
  mobile: {
    lcp: { good: number; needsImprovement: number; poor: number };
    fid: { good: number; needsImprovement: number; poor: number };
    cls: { good: number; needsImprovement: number; poor: number };
  };
}

function ExperiencePageContent() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<CoreWebVitalsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  const fetchData = async () => {
    if (!selectedWebsite?.url) {
      setError('Please select a website');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: responseData } = await api.get<CoreWebVitalsData>('/v1/search-console/experience', {
        params: {
          websiteId: selectedWebsite.url,
        },
      });

      setData(responseData);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch Core Web Vitals data');
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

  const getStatusIcon = (good: number, needsImprovement: number, poor: number) => {
    const total = good + needsImprovement + poor;
    const goodPercent = total > 0 ? (good / total) * 100 : 0;
    
    if (goodPercent >= 75) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (goodPercent >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (good: number, needsImprovement: number, poor: number) => {
    const total = good + needsImprovement + poor;
    const goodPercent = total > 0 ? (good / total) * 100 : 0;
    
    if (goodPercent >= 75) return 'text-green-600';
    if (goodPercent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Core Web Vitals</h1>
          <p className="text-gray-600 mt-1">Monitor your site's user experience metrics</p>
        </div>

        <GscTabs />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            {(['lcp', 'fid', 'cls'] as const).map((metric) => {
              const metricData = data[activeTab][metric];
              const total = metricData.good + metricData.needsImprovement + metricData.poor;
              const goodPercent = total > 0 ? ((metricData.good / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={metric} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metricData.good, metricData.needsImprovement, metricData.poor)}
                      <h3 className="text-lg font-semibold text-gray-900 uppercase">{metric}</h3>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(metricData.good, metricData.needsImprovement, metricData.poor)}`}>
                      {goodPercent}% Good
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metricData.good}</div>
                      <div className="text-sm text-gray-600 mt-1">Good</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{metricData.needsImprovement}</div>
                      <div className="text-sm text-gray-600 mt-1">Needs Improvement</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{metricData.poor}</div>
                      <div className="text-sm text-gray-600 mt-1">Poor</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Core Web Vitals data available</p>
            <p className="text-sm text-gray-500 mt-2">Core Web Vitals data will be available after Google analyzes your site</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ExperiencePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <ExperiencePageContent />
    </Suspense>
  );
}
