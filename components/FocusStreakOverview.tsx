'use client';

import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import ShareableCard from './ShareableCard';
import FocusStreakSkeleton from './FocusStreakSkeleton';
import { API_BASE_URL } from '@/lib/api';

type Block = {
  date: string;
  hasData: boolean;
};

type Props = {
  streak: number;
  longest: number;
  thisWeek: { date: string; count: number }[];
};

export default function FocusStreakOverview() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyDelta, setWeeklyDelta] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Compute color coding logic
  const getWeekday = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

  const dayGroups: Record<string, number[]> = {};
  blocks.forEach((b) => {
    const day = getWeekday(b.date);
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(b.hasData ? 1 : 0);
  });

const weekdayAverages: Record<string, number> = {};
for (const day in dayGroups) {
  const values = dayGroups[day];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  weekdayAverages[day] = Math.ceil(avg);
}
  console.log('Weekday averages:', weekdayAverages);

const getColor = (day: string, hasData: boolean) => {
  const avg = weekdayAverages[day];

  if (avg === 0 || avg === undefined) return 'bg-gray-300'; // No baseline

  const count = hasData ? 1 : 0;

  if (count > avg) return 'bg-green-400';
  if (count < avg) return 'bg-yellow-300';
  return 'bg-blue-400';
};
  
  useEffect(() => {
    const today = new Date();
    const token = localStorage.getItem('access_token');
    if (!token) return setError('Missing auth token');

    const fetchBlockStatus = async () => {
      try {
        const days = Array.from({ length: 14 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          return d;
        });

        const results: Block[] = [];

        for (const day of days) {
          const y = day.getFullYear();
          const m = day.getMonth() + 1;
          const d = day.getDate();
          const dateStr = day.toISOString().slice(0, 10);

          try {
            const res = await fetch(`${API_BASE_URL}/api/ultradian/?y=${y}&m=${m}&d=${d}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            results.push({ date: dateStr, hasData: res.status === 200 });
          } catch {
            results.push({ date: dateStr, hasData: false });
          }
        }

        setBlocks(results.slice(0, 7).reverse());
        const lastWeek = results.slice(7, 14);

        const thisWeekCount = results.slice(0, 7).filter(b => b.hasData).length;
        const lastWeekCount = lastWeek.filter(b => b.hasData).length;

        setWeeklyCount(thisWeekCount);
        setWeeklyDelta(thisWeekCount - lastWeekCount);

        const allDays = results.reverse();
        let current = 0;
        let max = 0;
        let temp = 0;

        for (const block of allDays) {
          if (block.hasData) {
            temp += 1;
            if (temp > max) max = temp;
          } else {
            if (current === 0) current = temp;
            temp = 0;
          }
        }

        setCurrentStreak(current === 0 ? temp : current);
        setLongestStreak(max);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockStatus();
  }, []);

  useEffect(() => {
    if (currentStreak > longestStreak) {
      import('canvas-confetti').then((module) => {
        module.default({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      });
    }
  }, [currentStreak, longestStreak]);

  if (loading) return <FocusStreakSkeleton />;

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="border border-pink-200 bg-pink-50 p-6 rounded-lg shadow-sm mb-6 text-center">
      <h2 className="text-xl font-bold text-pink-700 mb-3">🧠 Focus Streak (Last 7 Days)</h2>

      <div className="flex justify-center flex-wrap gap-2 mb-3">
        {blocks.map((b, i) => {
          const day = getWeekday(b.date);
          const color = getColor(day, b.hasData);
          return (
            <div
              key={i}
              title={`${day} — ${b.date}`}
              className={`w-8 h-8 rounded-md ${color} transition`}
            />
          );
        })}
      </div>

      <div className="text-sm text-gray-700 mb-1">
        {weeklyCount} blocks logged this week
      </div>
      <div className="text-sm mb-3">
        {weeklyDelta >= 0 ? (
          <span className="text-green-600">⬆ Up {weeklyDelta} from last week</span>
        ) : (
          <span className="text-red-600">⬇ Down {Math.abs(weeklyDelta)} from last week</span>
        )}
      </div>

      <div className="text-sm text-gray-800 flex justify-center gap-8">
        <span>🔁 Current streak: <strong>{currentStreak}</strong> days</span>
        <span>🏆 Longest streak: <strong>{longestStreak}</strong> days</span>
      </div>

      {currentStreak > 0 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div
            ref={cardRef}
            className="w-full max-w-[500px] bg-white px-6 pt-6 pb-4 rounded-xl shadow"
            style={{ display: 'none' }}
          >
            <ShareableCard
              streak={currentStreak}
              longest={longestStreak}
              thisWeek={blocks.map((b) => ({
                date: b.date,
                count: b.hasData ? 1 : 0,
              }))}
            />
          </div>

          <button
            onClick={async () => {
              if (!cardRef.current) return;
              cardRef.current.style.display = 'block';
              const canvas = await html2canvas(cardRef.current);
              cardRef.current.style.display = 'none';
              const link = document.createElement('a');
              link.download = 'ultradia-streak.png';
              link.href = canvas.toDataURL();
              link.click();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Download Shareable Streak Card
          </button>
        </div>
      )}
    </div>
  );
}
