'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UltradianChart from '@/components/UltradianChart';
import EnergyPotentialCard from '@/components/EnergyPotentialCard';

export default function UltradianPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
        });

        if (!userRes.ok) {
          router.push('/login');
          return;
        }

        const user = await userRes.json();
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth() + 1;
        const d = today.getDate();
        
        const recordRes = await fetch(`http://localhost:5000/api/records/today?y=${y}&m=${m}&d=${d}`, {
          credentials: 'include',
        });
        
        if (!recordRes.ok) {
          router.push('/log');
          return;
        }
        
        const recordData = await recordRes.json();
        const wakeTime = recordData.wake_time; // optionally store it in sessionStorage if you want
        
        const params = new URLSearchParams({
          y: today.getFullYear().toString(),
          m: (today.getMonth() + 1).toString(),
          d: today.getDate().toString(),
        });

        const res = await fetch(`http://localhost:5000/api/ultradian/?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
          setCycles(data.cycles);
        } else {
          setError(data.message || 'Failed to generate cycles');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Ultradian Rhythm</h1>

        <div className="mb-6">
          <EnergyPotentialCard />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <UltradianChart data={cycles} />
            <div className="space-y-4 mt-6">
              {cycles.map((cycle: any, i) => (
                <div key={i} className="p-4 border rounded bg-white shadow-sm">
                  <p className="text-lg font-semibold text-gray-800 mb-1">🌀 Cycle {cycle.cycle}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Peak:</span> {cycle.peak_start} – {cycle.peak_end}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Trough:</span> {cycle.trough_start} – {cycle.trough_end}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/history')}
                className="text-blue-600 hover:underline text-sm"
              >
                View Daily Record History →
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
