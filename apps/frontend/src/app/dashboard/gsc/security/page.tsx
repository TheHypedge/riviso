'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';

interface SecurityData {
  manualActions: Array<{ action: string; reason: string; affectedUrl?: string }>;
  securityIssues: Array<{ issue: string; severity: string; affectedUrl?: string }>;
}

function SecurityPageContent() {
  const { selectedWebsite } = useWebsite();
  const [data, setData] = useState<SecurityData | null>(null);
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
      const { data: responseData } = await api.get<SecurityData>('/v1/search-console/security', {
        params: {
          websiteId: selectedWebsite.url,
        },
      });

      setData(responseData);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch security data');
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

  const hasIssues = data && (data.manualActions.length > 0 || data.securityIssues.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security & Manual Actions</h1>
          <p className="text-gray-600 mt-1">Monitor security issues and manual actions from Google</p>
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
            {!hasIssues ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">All Clear</h3>
                    <p className="text-sm text-green-700 mt-1">No manual actions or security issues detected</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {data.manualActions.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900">Manual Actions</h3>
                    </div>
                    <div className="space-y-3">
                      {data.manualActions.map((action, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
                          <div className="font-medium text-red-900">{action.action}</div>
                          <div className="text-sm text-red-700 mt-1">{action.reason}</div>
                          {action.affectedUrl && (
                            <div className="text-xs text-red-600 mt-2">URL: {action.affectedUrl}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.securityIssues.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-900">Security Issues</h3>
                    </div>
                    <div className="space-y-3">
                      {data.securityIssues.map((issue, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border border-yellow-200">
                          <div className="font-medium text-yellow-900">{issue.issue}</div>
                          <div className="text-sm text-yellow-700 mt-1">Severity: {issue.severity}</div>
                          {issue.affectedUrl && (
                            <div className="text-xs text-yellow-600 mt-2">URL: {issue.affectedUrl}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No security data available</p>
            <p className="text-sm text-gray-500 mt-2">Security data will be available from Google Search Console</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <SecurityPageContent />
    </Suspense>
  );
}
