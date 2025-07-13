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
  onStageChange,
  onCycleComplete,
}: {
  wakeTime: string;
  peakDuration: number;
  troughDuration: number;
  grogDuration: number;
  cyclesCount: number;
  vibeScore: number | null;
  onStageChange?: (stage: Phase) => void;
  onCycleComplete?: (start: Date, end: Date, type: 'peak' | 'trough') => void;
}) {
  const [stage, setStage] = useState<Phase>('grog');
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [bgColor, setBgColor] = useState('bg-gray-200 text-gray-800');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('🟢 In Progress');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [hasSession, setHasSession] = useState(false); // ✅ NEW

useEffect(() => {
  const createSessionIfNeeded = async () => {
  const existingSession = localStorage.getItem('ultradian_session');
  if (existingSession) {
    const parsed = JSON.parse(existingSession);
    const sessionDate = new Date(parsed.startTimestamp).toDateString();
    const today = new Date().toDateString();

    if (sessionDate === today) {
      setHasSession(true);
      return;
    } else {
      // clear old session
      localStorage.removeItem('ultradian_session');
      sessionStorage.removeItem('logged_segments');
    }
  }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    const now = new Date();
    const sessionStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      wakeHour,
      wakeMinute,
      0,
      0
    );

    const payload = {
      wake_time: wakeTime.slice(0, 5), // ✅ critical fix!
      peak_duration: peakDuration,
      trough_duration: troughDuration,
      grog_duration: grogDuration,
      cycles_count: cyclesCount,
      started_at: sessionStart.toISOString(),
    };

    console.log('[Creating Record]', payload);

    try {
      const res = await fetch('http://localhost:5000/api/records/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(
          'ultradian_session',
          JSON.stringify({
            user_daily_record_id: data.id,
            startTimestamp: sessionStart.getTime(),
            wakeTime,
            peakDuration,
            troughDuration,
            grogDuration,
            cyclesCount,
          })
        );
        setHasSession(true);
      } else {
        console.error('[Server Error]', data);
      }
    } catch (err) {
      console.error('Failed to create record', err);
    }
  };

  createSessionIfNeeded();
}, [wakeTime, peakDuration, troughDuration, grogDuration, cyclesCount]);

  useEffect(() => {
    if (sessionEnded) return;

    const session = localStorage.getItem('ultradian_session');
    if (!session) {
      console.log('[Effect] No session, skipping tick');
      return;
    }

    console.log('[Effect] Session found, starting tick');
    const {
      startTimestamp,
      grogDuration,
      peakDuration,
      troughDuration,
      cyclesCount,
    } = JSON.parse(session);

    const start = new Date(Number(startTimestamp));

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
            onStageChange?.(seg.type);
          }

          if (seg.type === 'grog') {
            setCurrentCycle(0);
          } else {
            setCurrentCycle(
              Math.floor((segStart - grogDuration) / (peakDuration + troughDuration)) + 1
            );

            const logged: number[] = JSON.parse(
              sessionStorage.getItem('logged_segments') || '[]'
            );
            if (!logged.includes(i)) {
              const segStartTime = new Date(start.getTime() + segStart * 60000);
              logCycleEvent(segStartTime, now, seg.type);
              onCycleComplete?.(segStartTime, now, seg.type);
              const updated = [...logged, i];
              sessionStorage.setItem('logged_segments', JSON.stringify(updated));
            }
          }

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
      sessionStorage.removeItem('logged_segments');
      endSession();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionEnded, hasSession]); // ✅ WATCH hasSession

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const logCycleEvent = async (
  start: Date,
  end: Date,
  eventType: 'peak' | 'trough'
) => {
  const token = localStorage.getItem('access_token');
  const session = JSON.parse(localStorage.getItem('ultradian_session') || '{}');
  const recordId = session.user_daily_record_id;
  if (!token || !recordId) return;

  try {
    await fetch('http://localhost:5000/api/cycles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_daily_record_id: recordId,
        event_type: eventType,
        start_time: formatTime(start),
        end_time: formatTime(end),
      }),
    });
  } catch (err) {
    console.error('Failed to log cycle event', err);
  }
};

  const endSession = async () => {
    const token = localStorage.getItem('access_token');
    const session = JSON.parse(localStorage.getItem('ultradian_session') || '{}');
    const recordId = session.user_daily_record_id;
    if (!token || !recordId) return;

    try {
      await fetch(`http://localhost:5000/api/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ended_at: new Date().toISOString(),
        }),
      });
      localStorage.removeItem('ultradian_session');
    } catch (err) {
      console.error('Failed to end session', err);
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
              endSession();
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
