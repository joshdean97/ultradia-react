'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  phase: 'grog' | 'peak' | 'trough' | 'complete';
  vitalIndex: number | null;
};

const getTimeOfDay = (): 'early_morning' | 'late_morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 9) return 'early_morning';
  if (hour < 12) return 'late_morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getEnergyStatus = (vitalIndex: number | null): 'high' | 'stable' | 'low' => {
  if (vitalIndex === null) return 'stable';
  if (vitalIndex > 120) return 'high';
  if (vitalIndex >= 90) return 'stable';
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
    if (energy === 'stable') {
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

export default function CircadianPromptCard({ phase, vitalIndex }: Props) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const pathname = usePathname();
  const energyStatus = getEnergyStatus(vitalIndex);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, [pathname]);

  // Optional: auto-update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const prompt = getPrompt(phase, timeOfDay, energyStatus);

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-yellow-800">🧭 Circadian Prompt</h2>
        <span className="text-xs text-gray-500">{`⚡ ${energyStatus} | 🕒 ${timeOfDay.replace('_', ' ')}`}</span>
      </div>
      <p className="text-base mt-1 text-blue-700 font-medium leading-snug">
        {prompt}
      </p>
    </div>
  );
}
