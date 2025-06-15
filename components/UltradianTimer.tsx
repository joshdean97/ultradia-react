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

  useEffect(() => {
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
      for (const seg of segments) {
        const segStart = total;
        const segEnd = total + seg.duration;

        if (elapsedMin < segEnd) {
          const remainingSec = (segEnd - elapsedMin) * 60 - now.getSeconds();
          const minutes = String(Math.floor(remainingSec / 60)).padStart(2, '0');
          const seconds = String(remainingSec % 60).padStart(2, '0');
          setTimeLeft(`${minutes}:${seconds}`);
          setStage(seg.type);

          setBgColor(
            seg.type === 'peak' ? 'bg-green-500 text-white' :
            seg.type === 'trough' ? 'bg-blue-200' :
            seg.type === 'grog' ? 'bg-gray-200' :
            'bg-green-200'
          );
          return;
        }
        total = segEnd;
      }

      // If no segment matched, cycle is complete
      setStage('complete');
      setTimeLeft('');
      setBgColor('bg-green-200');
    };

    tick(); // initial call
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [wakeTime, peakDuration, troughDuration, grogDuration, cyclesCount]);

  return (
    <div className={`rounded-xl sm:rounded-2xl shadow text-center p-8 transition-all ${bgColor}`}>
      <h2 className="text-3xl font-bold mb-2">
        {stage === 'peak' && '🔶 Peak Focus'}
        {stage === 'trough' && '🔷 Trough Recovery'}
        {stage === 'grog' && '☁️ Morning Grog'}
        {stage === 'complete' && '✅ Cycle Complete'}
      </h2>
      {timeLeft && (
        <p className="text-4xl font-mono text-gray-800">{timeLeft}</p>
      )}
    </div>
  );
}
