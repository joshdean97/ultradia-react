'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CycleSelectorPage() {
  const router = useRouter();
  const [vibeScore, setVibeScore] = useState<number | null>(null);
  const [zone, setZone] = useState<string>('');
  const [selectedCycles, setSelectedCycles] = useState(3);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchVibeScore = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch('http://localhost:5000/api/vibe-score/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch vibe score');
        const data = await res.json();
        setVibeScore(data.score);
        setZone(data.zone);
        setSelectedCycles(recommended(data.score));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVibeScore();
  }, []);

  const recommended = (score: number | null) => {
    if (score === null) return 3;
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    return 2;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const token = localStorage.getItem("access_token");

    const res = await fetch('http://localhost:5000/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = await res.json();

    await fetch(`http://localhost:5000/api/users/${user.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cycles: selectedCycles }),
    });

    setTimeout(() => router.push('/ultradian'), 1800);
  };

  const zoneColor = {
    Green: 'text-green-600',
    Yellow: 'text-yellow-500',
    Orange: 'text-orange-500',
    Red: 'text-red-600',
  }[zone] || 'text-gray-600';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-blue-600 text-center">
          How many cycles do you want today?
        </h1>

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center text-green-600 font-semibold bg-green-50 border border-green-200 px-4 py-2 rounded"
            >
              ✔️ Vibe locked. Preparing your rhythm...
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          !submitted && (
            <>
              <div className="text-center text-sm">
                <p className="mb-1 text-gray-500">
                  Vibe Score: <span className="font-semibold text-blue-700">{vibeScore}</span>
                </p>
                <p className={`font-semibold ${zoneColor}`}>Zone: {zone}</p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Recommended: <button
                  type="button"
                  onClick={() => setSelectedCycles(recommended(vibeScore))}
                  className="underline text-blue-700 font-semibold"
                >
                  {recommended(vibeScore)} cycles
                </button>
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Based on your HRV, sleep, and mood.
              </p>

              <input
                type="range"
                min={0}
                max={6}
                value={selectedCycles}
                onChange={(e) => setSelectedCycles(Number(e.target.value))}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-gray-500">
                {[...Array(7).keys()].map(n => (
                  <span key={n} className={n === recommended(vibeScore) ? 'text-blue-700 font-bold' : ''}>
                    {n}
                  </span>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                Start My Rhythm →
              </button>

              <button
                onClick={() => {
                  setSelectedCycles(recommended(vibeScore));
                  handleSubmit();
                }}
                className="w-full border border-blue-600 text-blue-600 py-2 rounded transition hover:bg-blue-50"
              >
                Use Suggested and Continue →
              </button>
            </>
          )
        )}
      </div>
    </main>
  );
}
