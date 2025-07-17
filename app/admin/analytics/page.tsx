'use client';

import { useEffect, useState } from 'react';

type AnalyticsEvent = {
  event: string;
  meta: Record<string, any>;
  timestamp: string;
  user_id: number;
};

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError('Could not load analytics events.');
      }
    };

    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📈 Analytics Logs</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-auto bg-white shadow rounded-lg p-4">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Meta</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 font-medium">{e.event}</td>
                <td className="px-4 py-2">{e.user_id}</td>
                <td className="px-4 py-2 whitespace-pre-wrap text-xs">{JSON.stringify(e.meta, null, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
