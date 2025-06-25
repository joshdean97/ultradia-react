'use client';

import { useEffect, useState } from 'react';

type Phase = 'grog' | 'peak' | 'trough' | 'complete';

export default function UltradianTimer({
  wakeTime,
  peakDuration,
  troughDuration,
  grogDuration,
  cyclesCount,
}: {
  wakeTime: string;
  peakDuration: number;
  troughDuration: number;
  grogDuration: number;
  cyclesCount: number;
}) {
  const [stage, setStage] = useState<Phase>('grog');
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [bgColor, setBgColor] = useState('bg-gray-200');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('🟢 In Progress');
  const [currentCycle, setCurrentCycle] = useState(0);

  useEffect(() => {
    if (sessionEnded) return;

    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    const start = new Date();
    start.setHours(wakeHour, wakeMinute, 0, 0);

    const segments: { type: Phase; duration: number }[] = [
      { type: 'grog', duration: grogDuration },
    ];
    for (let i = 0; i < cyclesCount; i++) {
      segments.push({ type: 'peak', duration: peakDuration });
      segments.push({ type: 'trough', duration: troughDuration });
    }

    const tick = () => {
      const now = new Date();
      const elapsedMin = Math.floor((now.getTime() - start.getTime()) / 60000);

      let total = 0;
      let cycle = 0;

      for (const seg of segments) {
        const segStart = total;
        const segEnd = total + seg.duration;

        if (elapsedMin < segEnd) {
          const remainingSec = (segEnd - elapsedMin) * 60 - now.getSeconds();
          const minutes = String(Math.floor(remainingSec / 60)).padStart(2, '0');
          const seconds = String(remainingSec % 60).padStart(2, '0');
          setTimeLeft(`${minutes}:${seconds}`);
          setStage(seg.type);
          setCurrentCycle(Math.floor((segStart - grogDuration) / (peakDuration + troughDuration)) + 1);

          setBgColor(
            seg.type === 'peak' ? 'bg-green-600 text-white' :
            seg.type === 'trough' ? 'bg-blue-200 text-gray-800' :
            seg.type === 'grog' ? 'bg-gray-200 text-gray-800' :
            'bg-green-200 text-gray-800'
          );
          return;
        }
        total = segEnd;
      }

      // Session naturally complete
      setStage('complete');
      setTimeLeft('');
      setSessionStatus('✅ Session Complete');
      setBgColor('bg-green-200 text-gray-800');
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [wakeTime, peakDuration, troughDuration, grogDuration, cyclesCount, sessionEnded]);

  const handleEndSession = async () => {
    try {
      // Fetch today's record
      const res = await fetch('http://localhost:5000/records/today', {
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      });
  
      if (!res.ok) throw new Error('Failed to fetch today’s record');
  
      const record = await res.json();
  
      // Update the record with session end time
      const update = await fetch(`http://localhost:5000/records/${record.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          session_ended_at: new Date().toISOString(),
        }),
      });
  
      if (!update.ok) throw new Error('Failed to update session');
  
      // Local state update
      setSessionEnded(true);
      setStage('complete');
      setTimeLeft('');
      setSessionStatus('⏹ Session Ended');
      setBgColor('bg-gray-300 text-gray-700');
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Could not end session. Try again.');
    }
  };
  
  const getStageLabel = () => {
    switch (stage) {
      case 'peak': return '🔶 Peak Focus';
      case 'trough': return '🔷 Trough Recovery';
      case 'grog': return '☁️ Morning Grog';
      case 'complete': return sessionStatus;
      default: return '';
    }
  };

  return (
    <div className={`rounded-xl sm:rounded-2xl shadow text-center p-8 transition-all ${bgColor}`}>
      <h2 className="text-3xl font-bold mb-2">{getStageLabel()}</h2>

      {timeLeft && (
        <p className="text-5xl font-mono font-semibold mt-2 mb-1 text-white drop-shadow">
          {timeLeft}
        </p>
      )}

      {!sessionEnded && stage !== 'complete' && (
        <div className="mt-4">
          <span className="block text-sm font-medium text-white opacity-90 mb-2">
            {sessionStatus} • Cycle {currentCycle} of {cyclesCount}
          </span>
          <button
            onClick={handleEndSession}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            🛑 End Session
          </button>
        </div>
      )}

      {sessionEnded && (
        <div className="mt-4 text-green-700 text-sm font-medium">
          Session ended and saved ✔️
        </div>
      )}
    </div>
  );
}
