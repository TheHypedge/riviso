'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function InternalLinksRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/gsc/links');
  }, [router]);
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Redirecting to Links…</p>
      </div>
    </DashboardLayout>
  );
}
