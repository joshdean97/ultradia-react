'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

function GoogleCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const userId = params.get('user_id');
    const name = params.get('name');

    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_id', userId || '');
      localStorage.setItem('user_name', name || '');

      const checkRecord = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/records/today/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          router.push(res.ok ? '/ultradian' : '/log');
        } catch {
          router.push('/log');
        }
      };

      checkRecord();
    }
  }, [params, router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-500 text-sm">Logging you in via Google...</p>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400">Loading...</div>}>
      <GoogleCallback />
    </Suspense>
  );
}
