'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function GSCCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Search Console...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        await api.post('/v1/integrations/gsc/callback', { code, state });
        setStatus('success');
        setMessage('Successfully connected to Google Search Console!');
        // Redirect to Settings page where user initiated the connection
        setTimeout(() => router.push('/dashboard/settings'), 2000);
      } catch (err: any) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Connection failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-20 h-20 text-blue-600 mx-auto animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connecting...</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-3">Success!</h2>
              <p className="text-gray-700 mb-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to Settings...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-3">Connection Failed</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Settings
                </button>
                <button
                  onClick={() => router.push('/dashboard/gsc')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Go to Search Console
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function GSCCallbackPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-md w-full text-center">
            <Loader className="w-20 h-20 text-blue-600 mx-auto animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading...</h2>
            <p className="text-gray-600">Processing callback...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <GSCCallbackContent />
    </Suspense>
  );
}
