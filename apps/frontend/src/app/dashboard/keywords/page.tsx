'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

const mockKeywords = [
  { id: 1, keyword: 'seo tools', rank: 3, previousRank: 5, volume: 8100, difficulty: 72, trend: 'up' },
  { id: 2, keyword: 'keyword research', rank: 5, previousRank: 7, volume: 12000, difficulty: 65, trend: 'up' },
  { id: 3, keyword: 'content optimization', rank: 8, previousRank: 6, volume: 4200, difficulty: 58, trend: 'down' },
  { id: 4, keyword: 'backlink analysis', rank: 12, previousRank: 11, volume: 3600, difficulty: 70, trend: 'up' },
  { id: 5, keyword: 'competitor analysis', rank: 15, previousRank: 18, volume: 5800, difficulty: 68, trend: 'up' },
];

export default function KeywordsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Keywords & SERP</h1>
            <p className="mt-1 text-gray-600">Track your keyword rankings and SERP features</p>
          </div>
          <button className="btn btn-primary">
            Add Keywords
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatsCard
            title="Total Keywords"
            value="150"
            change={8}
            positive
          />
          <StatsCard
            title="Avg. Rank"
            value="12.5"
            change={-3.2}
            positive
          />
          <StatsCard
            title="Top 10 Rankings"
            value="42"
            change={12}
            positive
          />
        </div>

        {/* Search Bar */}
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Keywords Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Tracked Keywords</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Current Rank
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Change
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {kw.keyword}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      #{kw.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        kw.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kw.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(kw.rank - kw.previousRank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {kw.volume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        kw.difficulty >= 70 ? 'badge-danger' :
                        kw.difficulty >= 50 ? 'badge-warning' : 'badge-success'
                      }`}>
                        {kw.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button className="text-primary-600 hover:text-primary-700">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: number;
  positive: boolean;
}) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`flex items-center text-sm font-medium ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}
