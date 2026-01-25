'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import {
  BarChart3,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader,
  Unplug,
  AlertCircle,
  TrendingUp,
  MousePointer,
} from 'lucide-react';
import { useWebsite } from '@/contexts/WebsiteContext';

interface GscStatus {
  connected: boolean;
  properties: Array<{
    id: string;
    gscPropertyUrl: string;
    permissionLevel: string;
    lastSyncedAt: string | null;
  }>;
}

function GscPageContent() {
  const { selectedWebsite } = useWebsite();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<GscStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const [propertyModal, setPropertyModal] = useState<{ sites: string[]; googleAccountId: string } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [gscData, setGscData] = useState<{
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
  } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<GscStatus>('/v1/integrations/gsc/status');
      setStatus(data);
    } catch (e: any) {
      setStatus({ connected: false, properties: [] });
      setError(e?.response?.data?.message || 'Could not load GSC status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (!status?.connected || !status.properties?.length) {
      setGscData(null);
      return;
    }
    const site = status.properties[0].gscPropertyUrl;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 28);
    setDataLoading(true);
    api
      .post<{ totalClicks: number; totalImpressions: number; averageCtr: number; averagePosition: number }>(
        '/v1/integrations/gsc/data',
        {
          siteUrl: site,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          dimensions: ['date'],
        },
      )
      .then(({ data }) => setGscData(data))
      .catch(() => setGscData(null))
      .finally(() => setDataLoading(false));
  }, [status?.connected, status?.properties?.[0]?.gscPropertyUrl]);

  useEffect(() => {
    const success = searchParams.get('success');
    const err = searchParams.get('error');
    const multiple = searchParams.get('multiple');
    const sitesB64 = searchParams.get('sites');
    const googleAccountId = searchParams.get('googleAccountId');
    const property = searchParams.get('property');

    if (err) {
      setCallbackMessage(err === 'access_denied' ? 'Access denied' : decodeURIComponent(err));
      return;
    }
    if (success === '1') {
      if (multiple === '1' && sitesB64 && googleAccountId) {
        try {
          const sites = JSON.parse(atob(sitesB64)) as string[];
          setPropertyModal({ sites, googleAccountId });
          setCallbackMessage(null);
        } catch {
          setCallbackMessage('Connected. Select a property below.');
        }
      } else if (property) {
        setCallbackMessage(`Connected to ${property}`);
        checkStatus();
      } else {
        setCallbackMessage('Connected');
        checkStatus();
      }
    }
  }, [searchParams, checkStatus]);

  const connectGsc = async () => {
    setConnecting(true);
    setError(null);
    try {
      const websiteUrl = selectedWebsite?.url ?? '';
      const { data } = await api.get<{ authUrl: string }>(
        `/v1/integrations/gsc/connect${websiteUrl ? `?websiteUrl=${encodeURIComponent(websiteUrl)}` : ''}`,
      );
      if (data?.authUrl) window.location.href = data.authUrl;
      else setError('No auth URL returned');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to start connection');
    } finally {
      setConnecting(false);
    }
  };

  const saveProperty = async () => {
    if (!propertyModal || !selectedProperty) return;
    setError(null);
    try {
      await api.post('/v1/integrations/gsc/property', {
        googleAccountId: propertyModal.googleAccountId,
        propertyUrl: selectedProperty,
        websiteId: selectedWebsite?.id ?? undefined,
      });
      setPropertyModal(null);
      setSelectedProperty('');
      setCallbackMessage('Property saved');
      checkStatus();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save property');
    }
  };

  const disconnectGsc = async () => {
    setDisconnecting(true);
    setError(null);
    try {
      await api.post('/v1/integrations/gsc/disconnect');
      setStatus({ connected: false, properties: [] });
      setCallbackMessage(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Console</h1>
          <p className="text-gray-600 mt-1">
            Connect Google Search Console to unlock keyword, performance, and indexing insights.
          </p>
        </div>

        {callbackMessage && (
          <div
            className={`rounded-xl border p-4 flex items-center gap-3 ${
              callbackMessage.includes('denied') || callbackMessage.includes('error')
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            {callbackMessage.includes('denied') || callbackMessage.includes('error') ? (
              <XCircle className="w-6 h-6 shrink-0" />
            ) : (
              <CheckCircle className="w-6 h-6 shrink-0" />
            )}
            <p className="font-medium">{callbackMessage}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Google Search Console</h2>
                <p className="text-gray-600 mt-1">
                  Get real data: clicks, impressions, queries, pages. Read-only access.
                </p>
                {status?.connected && status.properties.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm font-medium text-green-700">
                      Connected to {status.properties[0].gscPropertyUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!status?.connected || status.properties.length === 0 ? (
              <button
                onClick={connectGsc}
                disabled={connecting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium shrink-0"
              >
                {connecting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Connect Google Search Console
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={disconnectGsc}
                disabled={disconnecting}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60 font-medium shrink-0"
              >
                {disconnecting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Unplug className="w-5 h-5" />
                )}
                Disconnect
              </button>
            )}
          </div>

          {selectedWebsite && !status?.connected && (
            <p className="text-sm text-gray-500 mt-4">
              Using <strong>{selectedWebsite.name || selectedWebsite.url}</strong> for property matching. Change site via the selector above.
            </p>
          )}
        </div>

        {status?.connected && status.properties.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dataLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : gscData ? (
              <>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MousePointer className="w-4 h-4" />
                    <span className="text-xs font-medium">Clicks</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gscData.totalClicks.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">Last 28 days</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs font-medium">Impressions</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gscData.totalImpressions.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">Last 28 days</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">CTR</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{(gscData.averageCtr * 100).toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Average</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="text-xs font-medium text-gray-500 mb-1">Avg. position</div>
                  <div className="text-2xl font-bold text-gray-900">{gscData.averagePosition.toFixed(1)}</div>
                  <div className="text-xs text-gray-500 mt-1">Last 28 days</div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {propertyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Select a property</h3>
              <p className="text-gray-600 text-sm mb-4">
                Multiple GSC properties matched. Choose one to link.
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {propertyModal.sites.map((url) => (
                  <label
                    key={url}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProperty === url ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="property"
                      value={url}
                      checked={selectedProperty === url}
                      onChange={() => setSelectedProperty(url)}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-900 truncate">{url}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveProperty}
                  disabled={!selectedProperty}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setPropertyModal(null);
                    setSelectedProperty('');
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function GscPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader className="w-12 h-12 text-primary-600 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <GscPageContent />
    </Suspense>
  );
}
