'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Users, TrendingUp, Globe, Link2 } from 'lucide-react';

const mockCompetitors = [
  {
    id: 1,
    domain: 'competitor1.com',
    name: 'Competitor 1',
    traffic: 85000,
    keywords: 3200,
    commonKeywords: 420,
    avgRank: 15,
    domainAuthority: 68,
  },
  {
    id: 2,
    domain: 'competitor2.com',
    name: 'Competitor 2',
    traffic: 62000,
    keywords: 2800,
    commonKeywords: 315,
    avgRank: 18,
    domainAuthority: 64,
  },
];

export default function CompetitorsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
            <p className="mt-1 text-gray-600">Track and analyze your competitors</p>
          </div>
          <button className="btn btn-primary">
            Add Competitor
          </button>
        </div>

        {/* Comparison Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Competitive Landscape</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <MetricCard
                icon={<Globe className="w-5 h-5" />}
                title="Your Domain Authority"
                value="58"
                subtitle="Industry avg: 62"
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Shared Keywords"
                value="735"
                subtitle="With top competitors"
              />
              <MetricCard
                icon={<Link2 className="w-5 h-5" />}
                title="Backlink Gap"
                value="2,400"
                subtitle="Behind leader"
              />
            </div>
          </div>
        </div>

        {/* Competitors List */}
        {mockCompetitors.map((competitor) => (
          <div key={competitor.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{competitor.name}</h3>
                  <p className="text-sm text-gray-600">{competitor.domain}</p>
                </div>
                <button className="btn btn-sm btn-secondary">
                  View Details
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatItem label="Est. Traffic" value={competitor.traffic.toLocaleString()} />
                <StatItem label="Total Keywords" value={competitor.keywords.toLocaleString()} />
                <StatItem label="Common Keywords" value={competitor.commonKeywords.toString()} />
                <StatItem label="Avg. Rank" value={`#${competitor.avgRank}`} />
                <StatItem label="Domain Authority" value={competitor.domainAuthority.toString()} />
              </div>
            </div>
          </div>
        ))}

        {/* Content Gaps */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Content Gap Opportunities</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <ContentGapItem
                keyword="advanced seo techniques"
                searchVolume={2400}
                competitors={['competitor1.com (rank #2)', 'competitor2.com (rank #5)']}
                opportunity={85}
              />
              <ContentGapItem
                keyword="technical seo audit"
                searchVolume={1800}
                competitors={['competitor1.com (rank #4)']}
                opportunity={78}
              />
              <ContentGapItem
                keyword="link building strategies"
                searchVolume={3200}
                competitors={['competitor1.com (rank #1)', 'competitor2.com (rank #3)']}
                opportunity={92}
              />
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-green-700">Your Strengths</h3>
            </div>
            <div className="card-body">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Strong technical SEO foundation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Fast page speed across all pages</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Excellent mobile experience</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-red-700">Areas to Improve</h3>
            </div>
            <div className="card-body">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">•</span>
                  <span>Lower backlink count vs competitors</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">•</span>
                  <span>Less content depth on key topics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">•</span>
                  <span>Fewer ranking keywords overall</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex p-2 mb-2 rounded-lg bg-primary-100 text-primary-600">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ContentGapItem({
  keyword,
  searchVolume,
  competitors,
  opportunity,
}: {
  keyword: string;
  searchVolume: number;
  competitors: string[];
  opportunity: number;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-base font-medium text-gray-900">{keyword}</h4>
          <p className="mt-1 text-sm text-gray-600">
            Search volume: {searchVolume.toLocaleString()}/mo
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Competitors ranking:</span>
            <div className="mt-1 space-y-1">
              {competitors.map((comp, idx) => (
                <div key={idx}>• {comp}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{opportunity}</div>
            <div className="text-xs text-gray-600">Opportunity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
