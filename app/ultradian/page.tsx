'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UltradianChart from '@/components/UltradianChart';


export default function UltradianPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        // First, get the user profile (for durations)
        const userRes = await fetch("http://localhost:5000/api/users/me", {
          credentials: "include",
        });

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const user = await userRes.json();

        // Get today's record to grab wake_time
        const today = new Date().toISOString().split("T")[0];

        // You’ll later replace this with a dedicated `/api/records/today` endpoint
        const wakeTime = sessionStorage.getItem("wake_time");
        if (!wakeTime) {
          router.push("/log");
          return;
        }

        const body = {
          wake_time: wakeTime,
          peak: user.peak_duration,
          trough: user.trough_duration,
          cycles: user.cycles_count,
          grog: user.grog_duration,
        };

        const res = await fetch("http://localhost:5000/api/ultradian/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
          setCycles(data.cycles);
        } else {
          setError(data.message || "Failed to generate cycles");
        }
      } catch (err) {
        setError("Something went wrong");
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
          </>
        )}
      </div>
    </main>
  );
  }
