'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { authService } from '@/lib/auth';
import { Save, Loader, KeyRound, User } from 'lucide-react';

/** Backend returns { success: false, error: { message } }. Handle string or array. */
function getApiErrorMessage(err: unknown, fallback: string): string {
  const d = (err as { response?: { data?: { error?: { message?: unknown }; message?: unknown } } })?.response?.data;
  const raw = d?.error?.message ?? d?.message;
  if (Array.isArray(raw)) return raw.length ? raw.join('. ') : fallback;
  if (typeof raw === 'string' && raw) return raw;
  return fallback;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    
    // Check for OAuth callback messages
    const oauthSuccess = searchParams?.get('oauth_success');
    const oauthError = searchParams?.get('oauth_error');
    
    if (oauthSuccess) {
      setSuccess('Google Search Console connected successfully!');
      // Clear URL param
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/dashboard/settings');
      }
    } else if (oauthError) {
      const errorMsg = decodeURIComponent(oauthError);
      setError(`OAuth connection failed: ${errorMsg}`);
      // Clear URL param
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/dashboard/settings');
      }
    }
    
    api
      .get<UserProfile>('/v1/users/me')
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data);
        setName(data.name ?? '');
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');
        setAvatar(data.avatar ?? '');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(e, 'Failed to load profile'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [searchParams]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const n = name.trim();
    const em = email.trim();
    if (!n) {
      setError('Full name is required.');
      return;
    }
    if (!em) {
      setError('Email is required. Your account is linked to this email.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch<UserProfile>('/v1/users/me', {
        name: n,
        email: em,
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      setProfile(data);
      authService.updateStoredUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
      });
      setSuccess('Profile saved.');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setPasswordChanging(true);
    try {
      await api.post('/v1/users/me/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setPasswordError(getApiErrorMessage(e, 'Failed to change password'));
    } finally {
      setPasswordChanging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account and integrations</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Account Information */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium">Account Information</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">
              Your account is linked to the email you used at registration. You can update your name, email, and other details below.
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile picture URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Password */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium">Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-green-700 text-sm">
                  {passwordSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" disabled={passwordChanging} className="btn btn-primary">
                {passwordChanging ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Integrations */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Integrations</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <IntegrationItem name="Google Search Console" description="Import search performance data and insights" provider="google_search_console" />
              <IntegrationItem name="Google Analytics" description="Connect your GA4 property to track website analytics" provider="google_analytics" />
              <IntegrationItem name="Google Ads" description="Connect your Google Ads account" provider="google_ads" />
              <IntegrationItem name="Meta" description="Connect your Meta (Facebook) account" provider="meta" />
              <IntegrationItem name="Google Tag Manager" description="Manage tags and tracking" provider="google_tag_manager" />
            </div>
          </div>
        </div>

        {/* API Access */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">API Access</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">
              Use API keys to integrate Riviso with your applications
            </p>
            <button type="button" className="btn btn-secondary">
              Generate API Key
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Notifications</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <NotificationToggle title="Email Notifications" description="Receive weekly reports and critical alerts" enabled={true} />
              <NotificationToggle title="Slack Notifications" description="Get real-time updates in your Slack workspace" enabled={false} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}

type IntegrationProvider = 'google_search_console' | 'google_ads' | 'meta' | 'google_analytics' | 'google_tag_manager';

function IntegrationItem({
  name,
  description,
  provider,
}: {
  name: string;
  description: string;
  provider: IntegrationProvider;
}) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Special handling for Google Search Console - use GSC-specific endpoints
  const isGSC = provider === 'google_search_console';

  useEffect(() => {
    let cancelled = false;
    if (isGSC) {
      // Check GSC connection status
      api.get<{ connected: boolean }>('/v1/integrations/gsc/status')
        .then(({ data }) => {
          if (cancelled) return;
          setConnected(data.connected ?? false);
        })
        .catch(() => {
          if (cancelled) return;
          setConnected(false);
        });
    } else {
      // Check generic integrations status
      api.get<{ integrations: { provider: string }[] }>('/v1/users/me/integrations')
        .then(({ data }) => {
          if (cancelled) return;
          setConnected(data.integrations?.some((i) => i.provider === provider) ?? false);
        })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [provider, isGSC]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (connected) {
        // Disconnect
        if (isGSC) {
          await api.post('/v1/integrations/gsc/disconnect');
        } else {
          await api.delete(`/v1/users/me/integrations/${provider}`);
        }
        setConnected(false);
      } else {
        // Connect
        if (isGSC) {
          // Get OAuth URL and redirect to Google
          const { data } = await api.get<{ authUrl: string }>('/v1/integrations/gsc/connect');
          if (data.authUrl) {
            // Redirect to Google OAuth
            window.location.href = data.authUrl;
            return; // Don't set loading to false, we're redirecting
          }
        } else {
          await api.post(`/v1/users/me/integrations/${provider}/connect`, {});
          setConnected(true);
        }
      }
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Failed to connect');
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <h4 className="text-base font-medium text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="ml-4">
        {connected ? (
          <div className="flex items-center gap-2">
            <span className="badge badge-success">Connected</span>
            <button type="button" onClick={toggle} disabled={loading} className="btn btn-sm btn-secondary">
              {loading ? '…' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button type="button" onClick={toggle} disabled={loading} className="btn btn-sm btn-primary">
            {loading ? '…' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-base font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={enabled} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}
