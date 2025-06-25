'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import ShareableCard from './ShareableCard';

export default function FocusStreakOverview() {
  const [blocks, setBlocks] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const hasCelebrated = useRef(false);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    thisWeek: [] as { date: string; count: number }[],
    lastWeek: [] as { date: string; count: number }[],
    streak: 0,
    longest: 0,
    isNewRecord: false,
    totalThisWeek: 0,
    delta: 0,
  });

  useEffect(() => {
    const fetchFocusBlocks = async () => {
      const today = new Date();
      const results: { date: string; count: number }[] = [];

      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();

        try {
          const res = await fetch(`http://localhost:5000/ultradian/?y=${y}&m=${m}&d=${d}`, {
            credentials: 'include',
          });
          const data = await res.json();

          results.push({
            date: date.toISOString().split('T')[0],
            count: res.ok
              ? data.cycles?.filter((c: any) => c.peak_start && c.peak_end).length || 0
              : 0,
          });
        } catch {
          results.push({ date: date.toISOString().split('T')[0], count: 0 });
        }
      }

      setBlocks(results);
      setLoading(false);

      const thisWeek = results.slice(7);
      const lastWeek = results.slice(0, 7);

      const totalThisWeek = thisWeek.reduce((acc, b) => acc + b.count, 0);
      const totalLastWeek = lastWeek.reduce((acc, b) => acc + b.count, 0);
      const delta = totalThisWeek - totalLastWeek;

      // ✅ Longest streak: oldest to newest across full 14 days
      let longest = 0;
      let temp = 0;
      for (const b of results) {
        if (b.count > 0) {
          temp++;
          if (temp > longest) longest = temp;
        } else {
          temp = 0;
        }
      }

      // ✅ Current streak: most recent 7 days, newest to oldest
      let current = 0;
      for (let i = results.length - 1; i >= results.length - 7; i--) {
        if (results[i].count > 0) current++;
        else break;
      }

      setMetrics({
        thisWeek,
        lastWeek,
        streak: current,
        longest,
        isNewRecord: current > longest,
        totalThisWeek,
        delta,
      });
    };

    fetchFocusBlocks();
  }, []);

  useEffect(() => {
    if (metrics.isNewRecord && !hasCelebrated.current) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      hasCelebrated.current = true;
    }
  }, [metrics.isNewRecord]);

  const handleSaveImage = async () => {
    if (!hiddenRef.current) return;
    const canvas = await html2canvas(hiddenRef.current, {
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `ultradia-streak-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return <p className="text-sm text-gray-500">Loading focus data…</p>;

  return (
    <div className="mb-8 px-4 sm:px-0">
      {/* 🔒 Hidden clean snapshot card */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0 }} ref={hiddenRef}>
        <ShareableCard
          streak={metrics.streak}
          longest={metrics.longest}
          thisWeek={metrics.thisWeek}
        />
      </div>

      {/* 🎯 Visible Card */}
      <div className="bg-white border text-gray-900 rounded-2xl p-6 sm:p-8 shadow text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-700">🧠 Focus Streak (Last 7 Days)</h2>

        <p className="text-gray-700 text-sm sm:text-base">
          🔥 {metrics.totalThisWeek} block{metrics.totalThisWeek !== 1 ? 's' : ''} logged this week
        </p>

        <p className={`text-sm sm:text-base font-medium ${
          metrics.delta > 0 ? 'text-green-600' : metrics.delta < 0 ? 'text-red-600' : 'text-gray-500'
        }`}>
          {metrics.delta > 0 && `📈 Up ${metrics.delta} from last week`}
          {metrics.delta < 0 && `📉 Down ${Math.abs(metrics.delta)} from last week`}
          {metrics.delta === 0 && `➖ Same as last week`}
        </p>

        <div className="flex justify-center flex-wrap gap-4 sm:gap-5 pt-2">
          {metrics.thisWeek.map((b, i) => {
            const weekday = new Date(b.date).toLocaleDateString('en-US', { weekday: 'short' });
            const color =
              b.count === 0
                ? 'bg-gray-200'
                : b.count < 2
                ? 'bg-yellow-300'
                : b.count < 4
                ? 'bg-orange-400'
                : 'bg-green-500';

            return (
              <div key={i} className="flex flex-col items-center w-10">
                <div
                  title={`${b.count} focus block${b.count !== 1 ? 's' : ''} on ${weekday}`}
                  className={`w-8 h-8 rounded-lg ${color} transform transition duration-300 hover:scale-110`}
                />
                <span className="text-[11px] text-gray-500 mt-1">{weekday}</span>
              </div>
            );
          })}
        </div>

        <div className="text-xs sm:text-sm text-gray-600 pt-2 space-y-1">
          <p>🎯 Current streak: {metrics.streak} day{metrics.streak !== 1 ? 's' : ''}</p>
          <p className={`${metrics.isNewRecord ? 'text-green-700 font-semibold animate-bounce' : ''}`}>
            🏆 Longest streak: {metrics.longest} day{metrics.longest !== 1 ? 's' : ''} {metrics.isNewRecord && '🎉 New Record!'}
          </p>
        </div>
      </div>

      {/* 🧩 Share Buttons */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <button
          onClick={() => {
            const msg = `🔥 I'm on a ${metrics.streak}-day focus streak using UltraDia!\nJoin me: https://ultradia.app`;
            navigator.clipboard.writeText(msg);
            alert('Copied! You can now paste your streak anywhere 💪');
          }}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          📤 Copy My Streak Message
        </button>

        <button
          onClick={handleSaveImage}
          className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          📷 Download Share Image
        </button>
      </div>
    </div>
  );
}
