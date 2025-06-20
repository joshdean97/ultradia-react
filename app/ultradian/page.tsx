'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UltradianTimer from '@/components/UltradianTimer';
import EnergyPotentialCard from '@/components/EnergyPotentialCard';
import CircadianPromptCard from '@/components/CircadianPromptCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function UltradianPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [user, setUser] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<'grog' | 'peak' | 'trough' | 'complete'>('grog');
  const [vitalIndex, setVitalIndex] = useState<number | null>(null);
  const [showCycles, setShowCycles] = useState(false);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const userRes = await fetch('http://localhost:5000/users/me', {
          credentials: 'include',
        });
        const user = await userRes.json();
        setUser(user);

        const wakeTimeStored = sessionStorage.getItem('wake_time');
        if (!wakeTimeStored) {
          router.push('/log');
          return;
        }
        setWakeTime(wakeTimeStored);

        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth() + 1;
        const d = today.getDate();

        const recordRes = await fetch(`http://localhost:5000/records/today?y=${y}&m=${m}&d=${d}`, {
          credentials: 'include',
        });
        if (!recordRes.ok) {
          router.push('/log');
          return;
        }

        const ultraRes = await fetch(`http://localhost:5000/ultradian/?y=${y}&m=${m}&d=${d}`, {
          credentials: 'include',
        });
        const data = await ultraRes.json();
        if (ultraRes.ok) {
          setCycles(data.cycles);
        } else {
          setError(data.message || 'Failed to generate cycles');
        }

        const energyRes = await fetch('http://localhost:5000/energy-potential/', {
          credentials: 'include',
        });
        const energy = await energyRes.json();
        setVitalIndex(energy.vital_index ?? null);
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white px-6 py-10 rounded-2xl shadow-md space-y-10">
        <h1 className="text-3xl font-bold text-center text-blue-600">Ultradian Rhythm</h1>

        <EnergyPotentialCard />

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
              onStageChange={setCurrentStage}
            />

            <CircadianPromptCard phase={currentStage} vitalIndex={vitalIndex} />

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