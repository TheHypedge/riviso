'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

interface GSCStatus {
  connected: boolean;
  integration?: {
    siteUrl: string;
    connectedAt: string;
    lastSyncAt?: string;
  };
}

interface GSCData {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
  rows: Array<{
    keys?: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export default function IntegrationsPage() {
  const [gscStatus, setGscStatus] = useState<GSCStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [gscData, setGscData] = useState<GSCData | null>(null);

  useEffect(() => {
    checkGSCStatus();
  }, []);

  const checkGSCStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken'
      const response = await fetch('http://localhost:4000/api/v1/integrations/gsc/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGscStatus(data);
        
        if (data.connected) {
          // Fetch GSC data
          await fetchGSCData();
        }
      }
    } catch (error) {
      console.error('Error checking GSC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGSCData = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken'
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);

      const response = await fetch('http://localhost:4000/api/v1/integrations/gsc/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteUrl: gscStatus.integration?.siteUrl || 'https://example.com',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['date'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGscData(data);
      }
    } catch (error) {
      console.error('Error fetching GSC data:', error);
    }
  };

  const connectGSC = async () => {
    setConnecting(true);
    try {
      const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken' not 'token'
      
      if (!token) {
        console.error('No authentication token found');
        setConnecting(false);
        return;
      }
      
      // Get OAuth authorization URL
      const response = await fetch('http://localhost:4000/api/v1/integrations/gsc/auth-url', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auth URL received:', data.authUrl);
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        const errorData = await response.json();
        console.error('Failed to get auth URL:', errorData);
        setConnecting(false);
      }
    } catch (error) {
      console.error('Error connecting GSC:', error);
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">
            Connect your tools to unlock powerful insights
          </p>
        </div>

        {/* GSC Connection Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-lg">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Google Search Console</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Get real data from your GSC account: clicks, impressions, queries, and more
                </p>
                {gscStatus.connected && gscStatus.integration && (
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">
                      Connected to {gscStatus.integration.siteUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {!gscStatus.connected ? (
              <button
                onClick={connectGSC}
                disabled={connecting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Connect GSC
                  </>
                )}
              </button>
            ) : (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                ✓ Connected
              </span>
            )}
          </div>
        </div>

        {gscStatus.connected && gscData ? (
          // GSC-Connected User View: Real Data
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{gscData.totalClicks.toLocaleString()}</div>
                <div className="text-sm text-blue-700 font-medium mt-1">Total Clicks</div>
                <div className="text-xs text-blue-600 mt-2">Last 28 days</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-900">{gscData.totalImpressions.toLocaleString()}</div>
                <div className="text-sm text-purple-700 font-medium mt-1">Impressions</div>
                <div className="text-xs text-purple-600 mt-2">Search appearances</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-900">{(gscData.avgCTR * 100).toFixed(2)}%</div>
                <div className="text-sm text-green-700 font-medium mt-1">Average CTR</div>
                <div className="text-xs text-green-600 mt-2">Click-through rate</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{gscData.avgPosition.toFixed(1)}</div>
                <div className="text-sm text-orange-700 font-medium mt-1">Avg. Position</div>
                <div className="text-xs text-orange-600 mt-2">Search ranking</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Performance Over Time</h3>
                  <p className="text-sm text-gray-600 mt-1">Clicks and impressions from Google Search</p>
                </div>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>

              <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Real GSC data chart would display here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {gscData.rows.length} days of data from{' '}
                    {gscData.rows[0]?.keys?.[0]} to{' '}
                    {gscData.rows[gscData.rows.length - 1]?.keys?.[0]}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Daily Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gscData.rows.slice(-10).reverse().map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.keys?.[0] || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.clicks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(row.ctr * 100).toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Non-Connected User View: Technical SEO Audits
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-2">
                    Connect GSC to Unlock Real Data
                  </h3>
                  <p className="text-sm text-orange-700">
                    Without Google Search Console connection, you're seeing estimated data. 
                    Connect your GSC account to get accurate clicks, impressions, queries, and performance data directly from Google.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Technical SEO Audit</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive website analysis including meta tags, headers, performance, and crawlability.
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Run Audit
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">On-Page SEO</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze content quality, keyword usage, internal linking, and page structure.
                </p>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Analyze
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
