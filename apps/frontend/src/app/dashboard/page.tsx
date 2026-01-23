'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, TrendingDown, Users, Target, Search } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const trafficData = [
  { date: '01/15', visitors: 2400, conversions: 58 },
  { date: '01/16', visitors: 2800, conversions: 67 },
  { date: '01/17', visitors: 2600, conversions: 62 },
  { date: '01/18', visitors: 3200, conversions: 76 },
  { date: '01/19', visitors: 2900, conversions: 69 },
  { date: '01/20', visitors: 3400, conversions: 81 },
  { date: '01/21', visitors: 3800, conversions: 91 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner spinner-lg text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Overview of your growth metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Organic Traffic"
            value="5,420"
            change={12.5}
            positive
            icon={<Search className="w-5 h-5" />}
          />
          <KPICard
            title="Avg. Rank"
            value="12.5"
            change={-3.2}
            positive
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <KPICard
            title="Keywords"
            value="150"
            change={8}
            positive
            icon={<Target className="w-5 h-5" />}
          />
          <KPICard
            title="Conversions"
            value="89"
            change={15.3}
            positive
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Traffic Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Organic Traffic Trend</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="visitors" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversions Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Conversion Trend</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <ActivityItem
                title="SEO Audit Completed"
                description="Your latest SEO audit shows 3 critical issues"
                time="2 hours ago"
              />
              <ActivityItem
                title="New Keyword Rankings"
                description="5 keywords moved into top 10 positions"
                time="5 hours ago"
              />
              <ActivityItem
                title="CRO Insight Generated"
                description="High-value opportunity found on /products page"
                time="1 day ago"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KPICard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
              {icon}
            </div>
          </div>
          <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <div className="w-2 h-2 mt-2 bg-primary-600 rounded-full" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="mt-1 text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
