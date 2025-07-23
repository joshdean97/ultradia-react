'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';


export default function GoogleCallback() {
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

      // Optional: check if a record exists before routing
      const checkRecord = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/records/today/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // ✅ Redirect here
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
