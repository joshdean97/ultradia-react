'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ users: number; records: number; leads: number } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  console.log('Rendering /admin page');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return router.push('/login');

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setStats(data);
      } catch {
        setError('Unauthorized or failed to load admin data.');
      }
    };

    fetchStats();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🔐 Admin Overview</h1>

      {error && <p className="text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Daily Records" value={stats.records} />
          <StatCard label="Leads" value={stats.leads} />
        </div>
      )}

      <div className="mt-10">
        <button
          onClick={() => router.push('/admin/analytics')}
          className="text-blue-600 hover:underline text-sm"
        >
          → View Analytics Logs
        </button>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-blue-700 mt-2">{value}</p>
    </div>
  );
}
