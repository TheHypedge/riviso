'use client';

import { MousePointer, Eye, TrendingUp } from 'lucide-react';

interface GscKpiCardsProps {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  dateRange?: { start: Date; end: Date } | null;
}

export function GscKpiCards({ clicks, impressions, ctr, position, dateRange }: GscKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <MousePointer className="w-4 h-4" />
          <span className="text-xs font-medium">Clicks</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{clicks.toLocaleString()}</div>
        {dateRange && (
          <div className="text-xs text-gray-500 mt-1">
            {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Impressions</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{impressions.toLocaleString()}</div>
        {dateRange && (
          <div className="text-xs text-gray-500 mt-1">
            {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">CTR</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{ctr.toFixed(2)}%</div>
        <div className="text-xs text-gray-500 mt-1">Average</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="text-xs font-medium text-gray-500 mb-1">Avg. Position</div>
        <div className="text-2xl font-bold text-gray-900">{position.toFixed(1)}</div>
        <div className="text-xs text-gray-500 mt-1">Average</div>
      </div>
    </div>
  );
}
