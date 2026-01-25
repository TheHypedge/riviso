'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, MoreHorizontal, X, Loader } from 'lucide-react';

/** Format Date as local YYYY-MM-DD for type="date" inputs (avoids timezone shift from toISOString). */
function toLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD string as local date (avoid UTC midnight). */
function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date;
}

interface GscDateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date, end: Date) => void;
  onRefresh: () => void;
  loading?: boolean;
  requestedRange?: { start: Date; end: Date } | null;
}

export function GscDateRangeSelector({
  startDate,
  endDate,
  onDateChange,
  onRefresh,
  loading = false,
  requestedRange,
}: GscDateRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowCustomPicker(false);
      }
    };

    if (showCustomPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCustomPicker]);

  const applyPreset = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    setLocalStart(start);
    setLocalEnd(end);
    onDateChange(start, end);
  };

  const applyCustom = () => {
    onDateChange(localStart, localEnd);
    setShowCustomPicker(false);
  };

  const isPresetActive = (days: number) => {
    if (!requestedRange) return false;
    const daysDiff = Math.ceil((requestedRange.end.getTime() - requestedRange.start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.abs(daysDiff - days) <= 1;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Date Range
        </h3>
        {requestedRange && (
          <span className="text-sm text-gray-500">
            {requestedRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {requestedRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: '24 hours', days: 0 },
          { label: '7 days', days: 6 },
          { label: '28 days', days: 27 },
          { label: '3 months', days: 89 },
          { label: '6 months', days: 179 },
          { label: '12 months', days: 364 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPresetActive(preset.days)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}

        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showCustomPicker
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            Custom
          </button>

          {showCustomPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 min-w-[320px]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Custom Date Range</h4>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={toLocalYYYYMMDD(localStart)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      const newStart = parseLocalDate(v);
                      newStart.setHours(0, 0, 0, 0);
                      setLocalStart(newStart);
                    }}
                    max={toLocalYYYYMMDD(localEnd)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={toLocalYYYYMMDD(localEnd)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      const newEnd = parseLocalDate(v);
                      newEnd.setHours(23, 59, 59, 999);
                      setLocalEnd(newEnd);
                    }}
                    max={toLocalYYYYMMDD(new Date())}
                    min={toLocalYYYYMMDD(localStart)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={applyCustom}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowCustomPicker(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Refresh Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
