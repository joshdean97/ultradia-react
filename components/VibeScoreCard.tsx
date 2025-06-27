'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function VibeScoreCard() {
  const [score, setScore] = useState<number | null>(null);
  const [zone, setZone] = useState('');
  const [prompt, setPrompt] = useState('');
  const [penalties, setPenalties] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    const fetchVibeScore = async () => {
      try {
        const res = await fetch('http://localhost:5000/vibe-score/', {
          credentials: 'include',
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch vibe score');
        }

        const data = await res.json();
        setScore(data.score);
        setZone(data.zone);
        setPrompt(data.prompt);
        setPenalties(data.penalties || []);

        if (data.score > 90 && !celebrated) {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
          setCelebrated(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVibeScore();
  }, [celebrated]);

  const zoneColorMap: Record<string, string> = {
    Green: 'text-green-600',
    Yellow: 'text-yellow-500',
    Orange: 'text-orange-500',
    Red: 'text-red-600',
  };

  const zoneTooltipMap: Record<string, string> = {
    Green: 'You’re highly recovered and ready for peak performance.',
    Yellow: 'You’re stable — functional but under mild strain.',
    Orange: 'Recovery needed. Go easy today.',
    Red: 'Your system is compromised. Prioritize full restoration.',
  };

  const zoneColor = zoneColorMap[zone] || 'text-gray-500';
  const zoneTooltip = zoneTooltipMap[zone] || 'No data';

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md mx-auto border border-gray-100 text-center space-y-4">
      <h2 className="text-sm font-semibold uppercase text-purple-600 tracking-wide flex justify-center items-center gap-1">
        🎯 Vibe Score
      </h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <>
          <p className={`text-5xl font-extrabold ${zoneColor}`}>{score}</p>
          <p className={`text-sm font-semibold ${zoneColor}`} title={zoneTooltip}>
            Zone: {zone}
          </p>

          <p className="text-blue-700 text-sm font-medium leading-snug">{prompt}</p>

          {penalties.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                  ⚠️ Factors Affecting Your Vibe
                </span>
              </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-outside pl-5 inline-block text-left">
                {penalties.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
