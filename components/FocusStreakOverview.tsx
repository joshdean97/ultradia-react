'use client';

import { useEffect, useState } from 'react';

type Block = {
  date: string;
  hasData: boolean;
};

export default function FocusStreakOverview() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyDelta, setWeeklyDelta] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const today = new Date();

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
            const res = await fetch(`http://localhost:5000/api/ultradian/?y=${y}&m=${m}&d=${d}`, {
              credentials: 'include',
            });

            if (res.status === 200) {
              results.push({ date: dateStr, hasData: true });
            } else {
              results.push({ date: dateStr, hasData: false });
            }
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

  if (loading) return null;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="border border-pink-200 bg-pink-50 p-6 rounded-lg shadow-sm mb-6 text-center">
      <h2 className="text-xl font-bold text-pink-700 mb-3">🧠 Focus Streak (Last 7 Days)</h2>

      <div className="flex justify-center flex-wrap gap-2 mb-3">
        {blocks.map((b, i) => (
          <div
            key={i}
            title={b.date}
            className={`w-8 h-8 rounded-md ${
              b.hasData ? 'bg-orange-400' : 'bg-gray-300'
            } transition`}
          />
        ))}
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
    </div>
  );
}
