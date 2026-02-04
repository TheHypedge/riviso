'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import {
  Loader,
  Link2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
  Unlink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

function getApiErrorMessage(err: unknown, fallback: string): string {
  const d = (err as { response?: { data?: { error?: { message?: unknown }; message?: unknown } } })?.response?.data;
  const raw = d?.error?.message ?? d?.message;
  if (Array.isArray(raw)) return raw.length ? raw.join('. ') : fallback;
  if (typeof raw === 'string' && raw) return raw;
  return fallback;
}

interface GscStatus {
  connected: boolean;
  properties?: Array<{
    id: string;
    gscPropertyUrl: string;
    permissionLevel?: string;
  }>;
  integration?: {
    connectedAt?: string;
    siteUrl?: string;
  };
}

interface ValidationResult {
  valid: boolean;
  message: string;
  needsReconnect?: boolean;
  properties?: Array<{
    id: string;
    siteUrl: string;
    permissionLevel?: string;
  }>;
}

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [gscStatus, setGscStatus] = useState<GscStatus>({ connected: false });
  const [gscLoading, setGscLoading] = useState(true);
  const [gscActionLoading, setGscActionLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const loadGscStatus = useCallback(async () => {
    try {
      const { data } = await api.get<GscStatus>('/v1/integrations/gsc/status');
      setGscStatus(data);
      return data;
    } catch {
      setGscStatus({ connected: false });
      return { connected: false };
    }
  }, []);

  const validateConnection = useCallback(async () => {
    setValidating(true);
    setWarning(null);
    try {
      const { data } = await api.get<ValidationResult>('/v1/integrations/gsc/validate');
      if (!data.valid) {
        if (data.needsReconnect) {
          setWarning(data.message);
          setGscStatus({ connected: false });
        } else {
          setWarning(data.message);
        }
      } else {
        setSuccess('Connection verified successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
      return data;
    } catch (e) {
      setWarning('Unable to validate connection. Please try again.');
      return { valid: false, message: 'Validation failed' };
    } finally {
      setValidating(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Check for OAuth callback messages
    const oauthSuccess = searchParams?.get('oauth_success');
    const oauthError = searchParams?.get('oauth_error');

    if (oauthSuccess) {
      setSuccess('Google Search Console connected successfully!');
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/dashboard/settings/integrations');
      }
    } else if (oauthError) {
      const errorMsg = decodeURIComponent(oauthError);
      setError(errorMsg);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/dashboard/settings/integrations');
      }
    }

    // Load GSC status
    loadGscStatus().finally(() => {
      if (!cancelled) setGscLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, loadGscStatus]);

  const handleConnectGSC = async () => {
    setGscActionLoading(true);
    setError(null);
    setWarning(null);
    try {
      const { data } = await api.get<{ authUrl: string }>('/v1/integrations/gsc/connect');
      if (data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }
      setError('Failed to get authorization URL. Please try again.');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to initiate connection. Please try again.'));
    } finally {
      setGscActionLoading(false);
    }
  };

  const handleDisconnectGSC = async () => {
    if (!confirm('Are you sure you want to disconnect Google Search Console? You can reconnect anytime.')) return;
    setGscActionLoading(true);
    setError(null);
    setWarning(null);
    try {
      const { data } = await api.post<{ message: string }>('/v1/integrations/gsc/disconnect');
      setGscStatus({ connected: false });
      setSuccess(data.message || 'Google Search Console disconnected.');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to disconnect. Please try again.'));
    } finally {
      setGscActionLoading(false);
    }
  };

  const handleValidate = async () => {
    await validateConnection();
  };

  const formatPropertyUrl = (url: string) => {
    if (url.startsWith('sc-domain:')) {
      return url.replace('sc-domain:', 'Domain: ');
    }
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Alerts */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {warning && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-700 text-sm">{warning}</p>
            <button
              onClick={handleConnectGSC}
              disabled={gscActionLoading}
              className="text-amber-700 text-sm font-medium underline mt-1 flex items-center gap-1"
            >
              {gscActionLoading ? <Loader className="w-3 h-3 animate-spin" /> : null}
              Reconnect Now
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Connected Services
          </h2>
          <p className="text-sm text-slate-600 mt-1">Manage your third-party integrations and data sources</p>
        </div>
        <div className="p-6">
          {/* Google Search Console Integration */}
          <div className={`rounded-2xl border-2 p-6 transition-all ${
            gscStatus.connected
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-start gap-4">
              {/* Google Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                gscStatus.connected
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
              }`}>
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">Google Search Console</h3>
                  {gscStatus.connected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Import search performance data, keywords, and insights from Google Search Console
                </p>

                {gscLoading ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Checking connection...</span>
                  </div>
                ) : gscStatus.connected ? (
                  <div className="space-y-4">
                    {/* Connected Properties */}
                    {gscStatus.properties && gscStatus.properties.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-green-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Connected Properties</h4>
                        <div className="space-y-2">
                          {gscStatus.properties.map((prop, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="font-mono">{formatPropertyUrl(prop.gscPropertyUrl)}</span>
                              {prop.permissionLevel && (
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                  {prop.permissionLevel}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connected date */}
                    {gscStatus.integration?.connectedAt && (
                      <p className="text-xs text-slate-500">
                        Connected on {new Date(gscStatus.integration.connectedAt).toLocaleDateString()}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleValidate}
                        disabled={validating}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 transition-colors"
                      >
                        {validating ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Verify Connection
                      </button>
                      <button
                        onClick={handleDisconnectGSC}
                        disabled={gscActionLoading}
                        className="px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm flex items-center gap-2 transition-colors"
                      >
                        {gscActionLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unlink className="w-4 h-4" />
                        )}
                        Disconnect
                      </button>
                      <a
                        href="https://search.google.com/search-console"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open GSC
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleConnectGSC}
                      disabled={gscActionLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all disabled:opacity-50"
                    >
                      {gscActionLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Link2 className="w-5 h-5" />
                      )}
                      Connect Google Search Console
                    </button>
                    <p className="text-xs text-slate-500 mt-3">
                      You'll be redirected to Google to authorize access. Make sure you have a verified property in Google Search Console.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coming Soon Integrations */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Coming Soon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Google Analytics 4', icon: '📊', desc: 'Website traffic and user behavior' },
                { name: 'Google Ads', icon: '📢', desc: 'Advertising performance data' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 flex items-center gap-4 opacity-60"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <p className="text-slate-600">Loading integrations...</p>
            </div>
          </div>
        }
      >
        <IntegrationsContent />
      </Suspense>
    </DashboardLayout>
  );
}
