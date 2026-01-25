'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        The dashboard encountered an error. This can happen if stored website data is invalid. Try
        clearing site data for this origin or use the actions below.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
        >
          Back to dashboard
        </Link>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        If this persists, open DevTools → Application → Local Storage → clear{' '}
        <code className="bg-gray-100 px-1 rounded">riviso_websites</code> and{' '}
        <code className="bg-gray-100 px-1 rounded">riviso_selected_website</code>, then reload.
      </p>
    </div>
  );
}
