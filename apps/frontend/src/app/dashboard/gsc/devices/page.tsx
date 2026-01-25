'use client';

import { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GscTabs } from '@/components/search-console/GscTabs';
import { GscDateRangeSelector } from '@/components/search-console/GscDateRangeSelector';
import { api } from '@/lib/api';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Loader, AlertCircle, Smartphone, Monitor, Tablet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeviceData {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function DevicesPageContent() {
  const { selectedWebsite } = useWebsite();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });
  const [requestedRange, setRequestedRange] = useState<{ start: Date; end: Date } | null>(null);

  const fetchData = async () => {
    if (!selectedWebsite?.url) {
      setError('Please select a website');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];

      const { data } = await api.get<DeviceData[]>('/v1/search-console/devices', {
        params: {
          websiteId: selectedWebsite.url,
          startDate,
          endDate,
        },
      });

      setDevices(data);
      setRequestedRange({ start: dateRange.start, end: dateRange.end });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch devices data');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.url) {
      fetchData();
    }
  }, [selectedWebsite?.url]);

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile') || d.includes('smartphone')) return Smartphone;
    if (d.includes('tablet')) return Tablet;
    return Monitor;
  };

  const chartData = devices.map(d => ({
    name: d.device,
    value: d.clicks,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1">Analyze search performance by device type</p>
        </div>

        <GscTabs />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <GscDateRangeSelector
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={(start, end) => {
            setDateRange({ start, end });
            setDevices([]);
          }}
          onRefresh={fetchData}
          loading={loading}
          requestedRange={requestedRange}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {devices.length > 0 && !loading && (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Device</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device, idx) => {
                      const Icon = getDeviceIcon(device.device);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {device.device}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right">{device.clicks.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right">{device.impressions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right">{device.ctr.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right">{device.position.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {devices.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No device data available</p>
            <p className="text-sm text-gray-500 mt-2">Click "Refresh Data" to fetch device performance data</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DevicesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <DevicesPageContent />
    </Suspense>
  );
}
