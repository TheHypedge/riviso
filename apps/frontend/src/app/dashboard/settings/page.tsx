'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account and integrations</p>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Account Information</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <button className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Integrations</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <IntegrationItem
                name="Google Analytics"
                description="Connect your GA4 property to track website analytics"
                connected={false}
              />
              <IntegrationItem
                name="Google Search Console"
                description="Import search performance data and insights"
                connected={false}
              />
              <IntegrationItem
                name="OpenAI"
                description="Configure AI model settings and API keys"
                connected={true}
              />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">API Access</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">
              Use API keys to integrate Riviso with your applications
            </p>
            <button className="btn btn-secondary">
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
              <NotificationToggle
                title="Email Notifications"
                description="Receive weekly reports and critical alerts"
                enabled={true}
              />
              <NotificationToggle
                title="Slack Notifications"
                description="Get real-time updates in your Slack workspace"
                enabled={false}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function IntegrationItem({
  name,
  description,
  connected,
}: {
  name: string;
  description: string;
  connected: boolean;
}) {
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
            <button className="btn btn-sm btn-secondary">Configure</button>
          </div>
        ) : (
          <button className="btn btn-sm btn-primary">Connect</button>
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
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}
