'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogRecordPage() {
  const router = useRouter();
  const [wakeTime, setWakeTime] = useState('');
  const [hrv, setHrv] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const todayRes = await fetch('http://localhost:5000/api/records/today/', {
        credentials: 'include',
      });

      const body = {
        wake_time: wakeTime,
        hrv: parseFloat(hrv),
      };

      if (todayRes.ok) {
        const existing = await todayRes.json();
        await fetch(`http://localhost:5000/api/records/${existing.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      } else {
        await fetch('http://localhost:5000/api/records/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      }

      sessionStorage.setItem('wake_time', wakeTime);
      router.push('/ultradian');
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-600">Log Daily Record</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="wake-time" className="block text-sm font-medium text-gray-700">
              Wake Time
            </label>
            <input
              type="time"
              id="wake-time"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="hrv" className="block text-sm font-medium text-gray-700">
              HRV (ms)
            </label>
            <input
              type="number"
              id="hrv"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={hrv}
              onChange={(e) => setHrv(e.target.value)}
              step="0.1"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit Record
          </button>
        </form>
      </div>
    </main>
  );
}
