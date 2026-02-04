'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingModal from '@/components/OnboardingModal';
import GSCRecommendationBanner from '@/components/GSCRecommendationBanner';
import { authService } from '@/lib/auth';
import { useWebsite } from '@/contexts/WebsiteContext';
import api from '@/lib/api';
import { UserInfo } from '@riviso/shared-types';
import {
  TrendingUp,
  Target,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  MousePointerClick,
  Clock,
  Sparkles,
  Zap,
  BarChart3,
  ChevronRight,
  Globe,
  Plus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

interface GscInsights {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksChange?: number;
  impressionsChange?: number;
  ctrChange?: number;
  positionChange?: number;
  topQueries?: Array<{ query: string; clicks: number; impressions: number }>;
  topPages?: Array<{ page: string; clicks: number; impressions: number }>;
  deviceData?: Array<{ device: string; clicks: number; impressions: number }>;
  dailyData?: Array<{ date: string; clicks: number; impressions: number }>;
}

// Mock data for when GSC is not connected
const mockTrafficData = [
  { date: '01/15', clicks: 240, impressions: 2400 },
  { date: '01/16', clicks: 280, impressions: 2800 },
  { date: '01/17', clicks: 260, impressions: 2600 },
  { date: '01/18', clicks: 320, impressions: 3200 },
  { date: '01/19', clicks: 290, impressions: 2900 },
  { date: '01/20', clicks: 340, impressions: 3400 },
  { date: '01/21', clicks: 380, impressions: 3800 },
];

const deviceData = [
  { name: 'Mobile', value: 45, color: '#8b5cf6' },
  { name: 'Desktop', value: 38, color: '#3b82f6' },
  { name: 'Tablet', value: 17, color: '#10b981' },
];

const topPages = [
  { page: '/products/seo-tools', views: 1240, change: 12.5 },
  { page: '/blog/seo-guide-2024', views: 980, change: -3.2 },
  { page: '/pricing', views: 750, change: 8.7 },
  { page: '/features', views: 620, change: 15.3 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'impressions'>('clicks');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { websites, selectedWebsite } = useWebsite();
  const [gscConnected, setGscConnected] = useState(false);
  const [gscData, setGscData] = useState<GscInsights | null>(null);
  const [gscLoading, setGscLoading] = useState(false);

  useEffect(() => {
    // Fetch user info to check onboarding status
    const fetchUser = async () => {
      const currentUser = authService.getUser();
      if (currentUser) {
        setUser(currentUser);
        // Show onboarding if not completed
        if (!currentUser.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Fetch GSC connection status and data
  useEffect(() => {
    const fetchGscData = async () => {
      setGscLoading(true);
      try {
        // Check GSC connection status
        const statusRes = await api.get('/v1/integrations/gsc/status');
        const connected = statusRes.data?.connected ?? false;
        setGscConnected(connected);

        if (connected) {
          // Fetch GSC overview data (uses last 28 days by default)
          const overviewRes = await api.get('/v1/search-console/overview', {
            params: { websiteId: selectedWebsite?.url || '' }
          });

          if (overviewRes.data) {
            setGscData({
              clicks: overviewRes.data.clicks ?? 0,
              impressions: overviewRes.data.impressions ?? 0,
              ctr: overviewRes.data.ctr ?? 0,
              position: overviewRes.data.position ?? 0,
              clicksChange: overviewRes.data.clicksChange,
              impressionsChange: overviewRes.data.impressionsChange,
              ctrChange: overviewRes.data.ctrChange,
              positionChange: overviewRes.data.positionChange,
              topQueries: overviewRes.data.topQueries,
              topPages: overviewRes.data.topPages,
              deviceData: overviewRes.data.deviceData,
              dailyData: overviewRes.data.dailyData,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch GSC data:', err);
        // Don't disconnect on error - just show no data
      } finally {
        setGscLoading(false);
      }
    };

    fetchGscData();
  }, [selectedWebsite?.url]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user info
    const updatedUser = authService.getUser();
    if (updatedUser) {
      setUser({ ...updatedUser, onboardingCompleted: true });
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // Don't mark as complete - show again next time
  };

  // Check if user has websites from context (more accurate than user.websiteCount)
  const hasWebsite = websites.length > 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
      )}

      <div className="space-y-8 pb-8">
        {/* GSC Recommendation Banner */}
        <GSCRecommendationBanner />

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="mt-2 text-slate-600">Here's what's happening with your website today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all hover:shadow-md">
              <Clock className="w-4 h-4 inline mr-2" />
              Last 7 days
            </button>
            <Link href="/dashboard/website-analyzer" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Analyze Website
            </Link>
          </div>
        </div>

        {/* Empty State - No Website Connected */}
        {!hasWebsite && (
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl border border-purple-100 p-8 text-center">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                No Website Connected Yet
              </h2>
              <p className="text-slate-600 mb-6">
                Connect your website to start analyzing SEO performance, track rankings, and get AI-powered recommendations to improve your search visibility.
              </p>
              <Link
                href="/dashboard/website-analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Your Website
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Content - Only show if website connected */}
        {hasWebsite && (
          <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link href="/dashboard/gsc/performance">
            <EnhancedKPICard
              title="Total Clicks"
              value={gscConnected && gscData ? gscData.clicks.toLocaleString() : '--'}
              change={gscData?.clicksChange ?? 0}
              positive={(gscData?.clicksChange ?? 0) >= 0}
              icon={<MousePointerClick className="w-5 h-5" />}
              subtitle={gscConnected ? 'last 28 days' : 'Connect GSC'}
              gradient="from-blue-500 to-cyan-500"
              chartData={gscData?.dailyData?.map(d => d.clicks) ?? mockTrafficData.map(d => d.clicks)}
              loading={gscLoading}
            />
          </Link>
          <Link href="/dashboard/gsc/performance">
            <EnhancedKPICard
              title="Impressions"
              value={gscConnected && gscData ? gscData.impressions.toLocaleString() : '--'}
              change={gscData?.impressionsChange ?? 0}
              positive={(gscData?.impressionsChange ?? 0) >= 0}
              icon={<Eye className="w-5 h-5" />}
              subtitle={gscConnected ? 'last 28 days' : 'Connect GSC'}
              gradient="from-purple-500 to-pink-500"
              chartData={gscData?.dailyData?.map(d => d.impressions) ?? mockTrafficData.map(d => d.impressions)}
              loading={gscLoading}
            />
          </Link>
          <Link href="/dashboard/gsc/performance">
            <EnhancedKPICard
              title="Avg. CTR"
              value={gscConnected && gscData ? `${gscData.ctr.toFixed(2)}%` : '--'}
              change={gscData?.ctrChange ?? 0}
              positive={(gscData?.ctrChange ?? 0) >= 0}
              icon={<Target className="w-5 h-5" />}
              subtitle={gscConnected ? 'click-through rate' : 'Connect GSC'}
              gradient="from-green-500 to-emerald-500"
              loading={gscLoading}
            />
          </Link>
          <Link href="/dashboard/gsc/performance">
            <EnhancedKPICard
              title="Avg. Position"
              value={gscConnected && gscData ? gscData.position.toFixed(1) : '--'}
              change={gscData?.positionChange ?? 0}
              positive={(gscData?.positionChange ?? 0) <= 0}
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle={gscConnected ? 'search ranking' : 'Connect GSC'}
              gradient="from-orange-500 to-red-500"
              loading={gscLoading}
            />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="SEO Audit"
            description="Run comprehensive SEO analysis"
            icon={<Activity className="w-5 h-5" />}
            href="/dashboard/website-analyzer"
            color="purple"
          />
          <QuickActionCard
            title="Keyword Research"
            description="Find new ranking opportunities"
            icon={<Search className="w-5 h-5" />}
            href="/dashboard/gsc/queries"
            color="blue"
          />
          <QuickActionCard
            title="AI Insights"
            description="Get AI-powered recommendations"
            icon={<Sparkles className="w-5 h-5" />}
            href="/dashboard/ai"
            color="pink"
          />
          <QuickActionCard
            title="Performance"
            description="View detailed analytics"
            icon={<BarChart3 className="w-5 h-5" />}
            href="/dashboard/gsc/performance"
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Traffic Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Traffic Overview</h3>
                    <p className="text-sm text-slate-600">Daily visitors and conversions</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setSelectedMetric('clicks')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        selectedMetric === 'clicks'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Clicks
                    </button>
                    <button
                      onClick={() => setSelectedMetric('impressions')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        selectedMetric === 'impressions'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Impressions
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={gscData?.dailyData ?? mockTrafficData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    {selectedMetric === 'clicks' ? (
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="url(#colorVisitors)"
                      />
                    ) : (
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorConversions)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
              <h3 className="text-lg font-semibold text-slate-900">Device Breakdown</h3>
              <p className="text-sm text-slate-600">Traffic by device type</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {deviceData.map((device) => (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }}></div>
                      <span className="text-sm font-medium text-slate-700">{device.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{device.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages / Top Queries */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-green-50">
              <h3 className="text-lg font-semibold text-slate-900">
                {gscConnected && gscData?.topQueries?.length ? 'Top Queries' : 'Top Pages'}
              </h3>
              <p className="text-sm text-slate-600">
                {gscConnected && gscData?.topQueries?.length ? 'Search queries from GSC' : 'Most visited pages'}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {gscConnected && gscData?.topQueries?.length ? (
                  gscData.topQueries.slice(0, 5).map((query, index) => (
                    <Link key={index} href="/dashboard/gsc/queries" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                          {query.query}
                        </p>
                        <p className="text-sm text-slate-600">{query.clicks.toLocaleString()} clicks</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{query.impressions.toLocaleString()} impr.</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  topPages.map((page, index) => (
                    <div key={index} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                          {page.page}
                        </p>
                        <p className="text-sm text-slate-600">{page.views.toLocaleString()} views</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-sm font-medium ${page.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {page.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(page.change)}%
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-600">Latest updates and insights</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <ActivityItem
                  title="SEO Audit Completed"
                  description="Your latest SEO audit shows 3 critical issues that need attention"
                  time="2 hours ago"
                  type="warning"
                  icon={<Activity className="w-4 h-4" />}
                />
                <ActivityItem
                  title="New Keyword Rankings"
                  description="5 keywords moved into top 10 positions"
                  time="5 hours ago"
                  type="success"
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <ActivityItem
                  title="AI Insight Generated"
                  description="High-value CRO opportunity found on /products page"
                  time="1 day ago"
                  type="info"
                  icon={<Sparkles className="w-4 h-4" />}
                />
                <ActivityItem
                  title="Traffic Spike Detected"
                  description="Unusual traffic increase on /blog/seo-guide-2024"
                  time="2 days ago"
                  type="success"
                  icon={<Zap className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function EnhancedKPICard({
  title,
  value,
  change,
  positive,
  icon,
  subtitle,
  gradient,
  chartData,
  loading,
}: {
  title: string;
  value: string;
  change: number;
  positive: boolean;
  icon: React.ReactNode;
  subtitle: string;
  gradient: string;
  chartData?: number[];
  loading?: boolean;
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          {!loading && change !== 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              positive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="space-y-1 mb-4">
          {loading ? (
            <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
          ) : (
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          )}
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* Mini chart */}
        {chartData && !loading && (
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.map((v) => ({ value: v }))}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={`url(#gradient-${title})`}
                  strokeWidth={2}
                  dot={false}
                />
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" className={gradient.split(' ')[0].replace('from-', '')} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'purple' | 'blue' | 'pink' | 'green';
}) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  return (
    <Link href={href}>
      <div className="group relative bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
        <div className="relative">
          <div className={`inline-flex p-2.5 bg-gradient-to-br ${colorClasses[color]} rounded-lg mb-3 shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({
  title,
  description,
  time,
  type,
  icon,
}: {
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  icon: React.ReactNode;
}) {
  const typeColors = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200">
      <div className={`flex-shrink-0 p-2 rounded-lg ${typeColors[type]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
        <p className="text-sm text-slate-600 mb-1">{description}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}
