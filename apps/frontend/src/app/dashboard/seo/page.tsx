'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Analysis</h1>
            <p className="mt-1 text-gray-600">Comprehensive SEO audit and recommendations</p>
          </div>
          <button className="btn btn-primary">
            Run New Audit
          </button>
        </div>

        {/* Overall Score */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Overall SEO Score</h3>
                <p className="text-sm text-gray-600">Last updated 2 hours ago</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-600">78</div>
                <p className="text-sm text-gray-600">out of 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <IssueCard
            severity="critical"
            count={1}
            label="Critical"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <IssueCard
            severity="high"
            count={3}
            label="High Priority"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <IssueCard
            severity="medium"
            count={7}
            label="Medium"
            icon={<Info className="w-5 h-5" />}
          />
          <IssueCard
            severity="low"
            count={12}
            label="Low Priority"
            icon={<CheckCircle className="w-5 h-5" />}
          />
        </div>

        {/* Issues List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Issues Found</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <IssueItem
                severity="critical"
                title="Slow Page Speed"
                description="Average page load time exceeds 3 seconds"
                affectedPages={2}
                impact={9}
              />
              <IssueItem
                severity="high"
                title="Missing Meta Descriptions"
                description="15 pages are missing meta descriptions"
                affectedPages={15}
                impact={8}
              />
              <IssueItem
                severity="medium"
                title="Duplicate H1 Tags"
                description="Multiple pages have duplicate H1 tags"
                affectedPages={5}
                impact={6}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recommendations</h3>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <RecommendationItem
                title="Improve Page Speed"
                priority={9}
                effort="medium"
                impact="high"
                actions={[
                  'Compress and optimize all images',
                  'Enable Gzip compression',
                  'Minify CSS and JavaScript',
                  'Implement lazy loading for images',
                ]}
              />
              <RecommendationItem
                title="Add Missing Meta Descriptions"
                priority={7}
                effort="low"
                impact="medium"
                actions={[
                  'Audit all pages without meta descriptions',
                  'Write compelling, keyword-rich descriptions',
                  'Keep descriptions between 150-160 characters',
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function IssueCard({
  severity,
  count,
  label,
  icon,
}: {
  severity: string;
  count: number;
  label: string;
  icon: React.ReactNode;
}) {
  const colors = {
    critical: 'bg-red-100 text-red-600',
    high: 'bg-orange-100 text-orange-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-green-100 text-green-600',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className={`inline-flex p-2 rounded-lg ${colors[severity as keyof typeof colors]}`}>
          {icon}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function IssueItem({
  severity,
  title,
  description,
  affectedPages,
  impact,
}: {
  severity: string;
  title: string;
  description: string;
  affectedPages: number;
  impact: number;
}) {
  const badges = {
    critical: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-info',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-medium text-gray-900">{title}</h4>
            <span className={`badge ${badges[severity as keyof typeof badges]}`}>
              {severity}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>{affectedPages} pages affected</span>
            <span>•</span>
            <span>Impact: {impact}/10</span>
          </div>
        </div>
        <button className="btn btn-sm btn-primary">
          View Details
        </button>
      </div>
    </div>
  );
}

function RecommendationItem({
  title,
  priority,
  effort,
  impact,
  actions,
}: {
  title: string;
  priority: number;
  effort: string;
  impact: string;
  actions: string[];
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-base font-medium text-gray-900">{title}</h4>
        <div className="flex gap-2">
          <span className="badge badge-info">Priority: {priority}</span>
          <span className="badge badge-default">Effort: {effort}</span>
          <span className="badge badge-success">Impact: {impact}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-gray-600">
        {actions.map((action, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}
