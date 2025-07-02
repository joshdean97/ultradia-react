'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  phase: 'grog' | 'peak' | 'trough' | 'complete';
  vibeScore: number | null;
};

const getTimeOfDay = (): 'early_morning' | 'late_morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 9) return 'early_morning';
  if (hour < 12) return 'late_morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getVibeStatus = (vibe: number | null): 'high' | 'balanced' | 'low' => {
  if (vibe === null) return 'balanced';
  if (vibe >= 4) return 'high';
  if (vibe >= 2) return 'balanced';
  return 'low';
};

const getPrompt = (phase: string, timeOfDay: string, energy: string) => {
  if (phase === 'grog') {
    return '☁️ Ease into the day with light movement, stretching, or journaling.';
  }

  if (phase === 'peak') {
    if (energy === 'high') {
      return '💪 Now’s the time for deep focus, creative sprints, or intense training like weightlifting or HIIT.';
    }
    if (energy === 'balanced') {
      return '⚖️ Ideal window for moderate cognitive work or a solid workout like a run, brisk walk, or circuit.';
    }
    return '📘 Use this peak to learn gently, organize tasks, or do light movement like yoga.';
  }

  if (phase === 'trough') {
    if (timeOfDay === 'afternoon') {
      if (energy === 'high') {
        return '🧘 Recharge with a walk outdoors or low-impact activity like swimming or stretching.';
      }
      return '🪷 Afternoon dip — perfect time for a nap, nature, or meditation.';
    }
    if (energy === 'low') {
      return '📴 Wind down with calming activities or gentle chores. Recovery is the priority now.';
    }
    return '☕ Consider slow, mindful breaks or mobility work to restore energy.';
  }

  if (phase === 'complete') {
    return '✅ You’ve completed your rhythm for today. Reflect, rest, or take a gentle walk to unwind.';
  }

  return '💤 No guidance available.';
};

export default function CircadianPromptCard({ phase, vibeScore }: Props) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const pathname = usePathname();

  const vibeStatus = getVibeStatus(typeof vibeScore === 'string' ? parseFloat(vibeScore) : vibeScore);

  const statusLabel = {
    high: 'Elevated 🔋',
    balanced: 'Balanced ⚖️',
    low: 'Depleted 💤',
  }[vibeStatus];

  const promptStyle = {
    high: 'bg-green-50 border-green-400',
    balanced: 'bg-yellow-50 border-yellow-400',
    low: 'bg-red-50 border-red-400',
  }[vibeStatus];

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, [pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const prompt = getPrompt(phase, timeOfDay, vibeStatus);

  return (
    <div className={`border-l-4 p-4 rounded-md shadow ${promptStyle}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800">🧭 Circadian Prompt</h2>
        <span className="text-xs text-gray-600">
          {`${statusLabel} | 🕒 ${timeOfDay.replace('_', ' ')}`}
        </span>
      </div>
      <p className="text-base mt-1 text-blue-700 font-medium leading-snug">
        {prompt}
      </p>
    </div>
  );
}
