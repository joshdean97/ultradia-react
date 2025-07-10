'use client';

import { useEffect, useState } from 'react';

type Phase = 'grog' | 'peak' | 'trough' | 'complete';

export default function UltradianTimer({
  wakeTime,
  peakDuration,
  troughDuration,
  grogDuration,
  cyclesCount,
  vibeScore,
}: {
  wakeTime: string;
  peakDuration: number;
  troughDuration: number;
  grogDuration: number;
  cyclesCount: number;
  vibeScore: number | null;
}) {
  const [stage, setStage] = useState<Phase>('grog');
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [bgColor, setBgColor] = useState('bg-gray-200 text-gray-800');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('🟢 In Progress');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [stageStartTime, setStageStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const existingSession = localStorage.getItem('ultradian_session');
    const sessionStart = new Date();
    sessionStart.setHours(...wakeTime.split(':').map(Number));

    if (!existingSession) {
      localStorage.setItem(
        'ultradian_session',
        JSON.stringify({
          startTimestamp: sessionStart.getTime(),
          wakeTime,
          peakDuration,
          troughDuration,
          grogDuration,
          cyclesCount,
        })
      );
    }
  }, [wakeTime, peakDuration, troughDuration, grogDuration, cyclesCount]);

  useEffect(() => {
    if (sessionEnded) return;

    const session = localStorage.getItem('ultradian_session');
    if (!session) return;
    const {
      startTimestamp,
      grogDuration,
      peakDuration,
      troughDuration,
      cyclesCount,
    } = JSON.parse(session);

    const start = new Date(startTimestamp);

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

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segStart = total;
        const segEnd = total + seg.duration;

        if (elapsedMin < segEnd) {
          const remainingSec = (segEnd - elapsedMin) * 60 - now.getSeconds();
          const minutes = String(Math.floor(remainingSec / 60)).padStart(2, '0');
          const seconds = String(remainingSec % 60).padStart(2, '0');
          setTimeLeft(`${minutes}:${seconds}`);

          if (stage !== seg.type) {
            setStage(seg.type);
            setStageStartTime(now);
          }

          if (
            (seg.type === 'peak' || seg.type === 'trough') &&
            stageStartTime
          ) {
            const logged: number[] = JSON.parse(sessionStorage.getItem('logged_segments') || '[]');
            if (!logged.includes(i)) {
              logCycleEvent(stageStartTime, now, seg.type);
              const updated = [...logged, i];
              sessionStorage.setItem('logged_segments', JSON.stringify(updated));
            }
          }

          setCurrentCycle(Math.floor((segStart - grogDuration) / (peakDuration + troughDuration)) + 1);

          let color = 'bg-gray-200 text-gray-800';
          if (seg.type === 'peak') {
            if (vibeScore !== null) {
              if (vibeScore >= 4) color = 'bg-green-600 text-white';
              else if (vibeScore >= 2) color = 'bg-yellow-400 text-gray-900';
              else color = 'bg-rose-200 text-gray-800';
            } else {
              color = 'bg-blue-500 text-white';
            }
          } else if (seg.type === 'trough') {
            color = 'bg-blue-200 text-gray-800';
          }

          setBgColor(color);
          return;
        }

        total = segEnd;
      }

      setStage('complete');
      setTimeLeft('');
      setSessionStatus('✅ Session Complete');
      setBgColor('bg-green-200 text-gray-800');
      sessionStorage.removeItem('logged_segments');
      localStorage.removeItem('ultradian_session');
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionEnded, stage, stageStartTime, vibeScore]);

  const logCycleEvent = async (start: Date, end: Date, eventType: 'peak' | 'trough') => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await fetch('http://localhost:5000/api/cycles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_type: eventType,
          start_time: start.toTimeString().split(' ')[0],
          end_time: end.toTimeString().split(' ')[0],
        }),
      });
    } catch (err) {
      console.error('Failed to log cycle event', err);
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

  const getEndSessionStyle = () => {
    if (vibeScore === null) return 'bg-blue-600 hover:bg-blue-700';
    if (vibeScore >= 4) return 'bg-green-700 hover:bg-green-800';
    if (vibeScore >= 2) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-600 hover:bg-red-700';
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
            onClick={() => {
              setSessionEnded(true);
              sessionStorage.removeItem('logged_segments');
              localStorage.removeItem('ultradian_session');
            }}
            className={`${getEndSessionStyle()} text-white px-4 py-2 rounded-lg text-sm font-semibold transition`}
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