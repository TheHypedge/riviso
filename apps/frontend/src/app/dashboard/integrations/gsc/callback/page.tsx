'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader, Globe, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

interface CallbackResponse {
  success: boolean;
  requiresPropertySelection?: boolean;
  googleAccountId?: string;
  email?: string;
  sites?: GscSite[];
  message?: string;
}

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  const message = err?.response?.data?.message || err?.message;

  // Clean up technical error messages
  if (typeof message === 'string') {
    // Already user-friendly messages from backend
    if (message.includes('Please') || message.includes('try again') || message.includes('Settings')) {
      return message;
    }
    // Fallback for any remaining technical messages
    if (message.includes('401') || message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again and try connecting.';
    }
    if (message.includes('400') || message.includes('Bad Request')) {
      return 'Something went wrong with the connection. Please try again.';
    }
    if (message.includes('network') || message.includes('ECONNREFUSED')) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    return message;
  }

  return 'Connection failed. Please try again.';
}

function GSCCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'select-property' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Search Console...');
  const [sites, setSites] = useState<GscSite[]>([]);
  const [googleAccountId, setGoogleAccountId] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handlePropertySelection = async (accountId: string, site: GscSite) => {
    setSaving(true);
    try {
      const response = await api.post('/v1/integrations/gsc/select-property', {
        googleAccountId: accountId,
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel,
      });

      setStatus('success');
      setMessage(response.data?.message || `Successfully connected to ${site.siteUrl}!`);

      // Redirect after success
      setTimeout(() => router.push('/dashboard/settings/integrations'), 2000);
    } catch (err: unknown) {
      console.error('Property selection error:', err);
      setStatus('error');
      setMessage(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    router.push('/dashboard/settings/integrations');
  };

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const state = searchParams.get('state');

      // Handle Google OAuth errors
      if (error) {
        setStatus('error');
        if (error === 'access_denied') {
          setMessage('You cancelled the connection request. Click "Try Again" to connect Google Search Console.');
        } else if (errorDescription) {
          setMessage(decodeURIComponent(errorDescription));
        } else {
          setMessage(`Authentication failed: ${error}. Please try again.`);
        }
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Google. Please try connecting again.');
        return;
      }

      if (!state) {
        setStatus('error');
        setMessage('Invalid connection request. Please go back to Settings and try connecting again.');
        return;
      }

      try {
        // Get user email from localStorage for cross-account connection tracking
        let userEmail: string | undefined;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            userEmail = user.email;
          }
        } catch (e) {
          console.warn('Could not get user email from localStorage');
        }

        setMessage('Authenticating with Google...');

        const response = await api.post<CallbackResponse>('/v1/integrations/gsc/callback', {
          code,
          state,
          email: userEmail
        });

        const data = response.data;

        if (data.requiresPropertySelection && data.sites && data.sites.length > 0) {
          // Always show property selection UI - let user confirm their choice
          setSites(data.sites);
          setGoogleAccountId(data.googleAccountId || '');
          setStatus('select-property');

          if (data.sites.length === 1) {
            // Pre-select the only property
            setSelectedSite(data.sites[0].siteUrl);
            setMessage('Confirm the property you want to connect:');
          } else {
            setMessage('Select which property you want to connect:');
          }
        } else if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Successfully connected to Google Search Console!');
          setTimeout(() => router.push('/dashboard/settings/integrations'), 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Connection failed. Please try again.');
        }
      } catch (err: unknown) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(getErrorMessage(err));
      }
    };

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const handleSelectProperty = () => {
    if (!selectedSite || !googleAccountId) return;
    const site = sites.find(s => s.siteUrl === selectedSite);
    if (site) {
      handlePropertySelection(googleAccountId, site);
    }
  };

  const formatPermissionLevel = (level: string) => {
    const labels: Record<string, string> = {
      'siteOwner': 'Owner',
      'siteFullUser': 'Full User',
      'siteRestrictedUser': 'Restricted User',
      'siteUnverifiedUser': 'Unverified User',
    };
    return labels[level] || level.replace(/([A-Z])/g, ' $1').trim();
  };

  const formatSiteUrl = (url: string) => {
    if (url.startsWith('sc-domain:')) {
      return url.replace('sc-domain:', 'Domain: ');
    }
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-blue-600 mx-auto animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connecting...</h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'select-property' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Property</h2>
                <p className="text-gray-600">{message}</p>
              </div>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {sites.map((site) => (
                  <button
                    key={site.siteUrl}
                    onClick={() => setSelectedSite(site.siteUrl)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSite === site.siteUrl
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{formatSiteUrl(site.siteUrl)}</p>
                        <p className="text-sm text-gray-500">
                          {formatPermissionLevel(site.permissionLevel)}
                        </p>
                      </div>
                      {selectedSite === site.siteUrl && (
                        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSelectProperty}
                disabled={!selectedSite || saving}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  selectedSite && !saving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Property
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                This will enable search analytics and insights for the selected property.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-3">Success!</h2>
              <p className="text-gray-700 mb-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to Integrations...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-3">Connection Failed</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {retrying ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/dashboard/gsc')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Go to Search Console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function GSCCallbackPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-md w-full text-center">
            <Loader className="w-16 h-16 text-blue-600 mx-auto animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading...</h2>
            <p className="text-gray-600">Processing callback...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <GSCCallbackContent />
    </Suspense>
  );
}
