'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UltradianTimer from '@/components/UltradianTimer';
import CircadianPromptCard from '@/components/CircadianPromptCard';
import { motion, AnimatePresence } from 'framer-motion';
import VibeScoreCard from '@/components/VibeScoreCard';

export default function UltradianPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [user, setUser] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<'grog' | 'peak' | 'trough' | 'complete'>('grog');
  const [vibeScore, setVibeScore] = useState<number | null>(null);
  const [showCycles, setShowCycles] = useState(false);

useEffect(() => {
  const fetchEverything = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return router.push('/login');

    const today = new Date(); // 🟢 Move these up
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await fetch('http://localhost:5000/api/users/me', { headers });
      if (!userRes.ok) throw new Error('Unauthorized');
      const userData = await userRes.json();
      setUser(userData);

      let wakeTimeStored = sessionStorage.getItem('wake_time');

      if (!wakeTimeStored) {
        const recordRes = await fetch(`http://localhost:5000/api/records/today?y=${y}&m=${m}&d=${d}`, {
          headers,
        });

        if (!recordRes.ok) return router.push('/log');

        const record = await recordRes.json();
        wakeTimeStored = record.wake_time;
        sessionStorage.setItem('wake_time', wakeTimeStored);
      }

      setWakeTime(wakeTimeStored);
      console.log('Wake time:', wakeTimeStored);

      const recordRes = await fetch(`http://localhost:5000/api/records/today?y=${y}&m=${m}&d=${d}`, {
        headers,
      });
      if (!recordRes.ok) return router.push('/log');
      const record = await recordRes.json();
      setVibeScore(record.vibe_score ?? null);

      const ultraRes = await fetch(`http://localhost:5000/api/ultradian/?y=${y}&m=${m}&d=${d}`, {
        headers,
      });
      const data = await ultraRes.json();
      if (ultraRes.ok) {
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

  fetchEverything();
}, [router]);

  const handleCycleComplete = async (
  start: string,
  end: string,
  eventType: 'peak' | 'trough'
) => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:5000/api/cycles', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_time: start,
        end_time: end,
        event_type: eventType,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn('Failed to log cycle:', err);
    } else {
      console.log(`✅ Logged ${eventType} event`);
    }
  } catch (err) {
    console.error('Error logging cycle:', err);
  }
  console.log('[Session]', localStorage.getItem('ultradian_session'));

};

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white px-6 py-10 rounded-2xl shadow-md space-y-10">
        <h1 className="text-3xl font-bold text-center text-blue-600">Ultradian Rhythm</h1>

        <VibeScoreCard />

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <>
          <UltradianTimer
            wakeTime={wakeTime}
            peakDuration={user.peak_duration}
            troughDuration={user.trough_duration}
            grogDuration={user.grog_duration}
            cyclesCount={user.cycles_count}
            vibeScore={vibeScore}
            onStageChange={setCurrentStage}
            onCycleComplete={handleCycleComplete}
          />

            <CircadianPromptCard phase={currentStage} vibeScore={vibeScore} />

            <div className="pt-6 border-t">
              <button
                onClick={() => setShowCycles(!showCycles)}
                className="flex items-center justify-between w-full text-sm font-medium text-blue-700 hover:underline"
              >
                {showCycles ? 'Hide Cycles ▲' : 'Show All Cycles ▼'}
              </button>

              <AnimatePresence>
                {showCycles && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 mt-4 overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/history')}
                className="mt-10 text-blue-600 hover:underline text-sm"
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
