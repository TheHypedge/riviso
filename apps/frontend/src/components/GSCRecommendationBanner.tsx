'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

interface GscStatus {
  connected: boolean;
}

export default function GSCRecommendationBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('gsc-banner-dismissed');
      if (wasDismissed) {
        const dismissedDate = new Date(wasDismissed);
        const now = new Date();
        // Show again after 7 days
        if (now.getTime() - dismissedDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
          setDismissed(true);
          return;
        }
      }
    }

    // Check GSC connection status
    api
      .get<GscStatus>('/v1/integrations/gsc/status')
      .then(({ data }) => {
        setIsConnected(data.connected);
      })
      .catch(() => {
        setIsConnected(false);
      });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gsc-banner-dismissed', new Date().toISOString());
    }
  };

  // Don't show if already connected, dismissed, or still loading
  if (isConnected === null || isConnected || dismissed) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Search className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
              Recommended
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Connect Google Search Console
          </h3>
          <p className="text-white/80 text-sm">
            Get detailed search analytics, keyword rankings, click-through rates, and discover new opportunities to improve your SEO.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/settings/integrations"
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
        >
          Connect Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
