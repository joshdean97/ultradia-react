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
  if (vibe === null || isNaN(vibe)) return 'balanced';
  if (vibe >= 85) return 'high';
  if (vibe >= 50) return 'balanced';
  return 'low';
};

const getPrompt = (
  phase: 'grog' | 'peak' | 'trough' | 'complete',
  timeOfDay: 'early_morning' | 'late_morning' | 'afternoon' | 'evening',
  energy: 'high' | 'balanced' | 'low'
) => {
  if (phase === 'grog') {
    if (timeOfDay === 'early_morning') {
      return '☁️ Ease into the day with sunlight, hydration, and gentle movement. A mindful start sets the tone.';
    }
    return '🌤️ Still feeling groggy? Get sunlight on your skin and move your body — rhythm reset incoming.';
  }

  if (phase === 'peak') {
    if (energy === 'high') {
      if (timeOfDay === 'late_morning') {
        return '🧠 High-output window: write, plan, strategize, or sprint on creative work.';
      }
      if (timeOfDay === 'afternoon') {
        return '💪 Afternoon surge: use it for performance tasks or high-leverage decision-making.';
      }
      return '⚡ Energy’s high — use this peak to ship something meaningful.';
    }

    if (energy === 'balanced') {
      return '⚖️ Great time for focused tasks, moderate workouts, or social flow sessions.';
    }

    return '📘 Use this peak gently: catch up on light reading, prep your to-dos, or do mobility work.';
  }

  if (phase === 'trough') {
    if (timeOfDay === 'afternoon') {
      if (energy === 'high') {
        return '🧘 Afternoon recharge: go for a walk, stretch out, or find a quiet flow zone.';
      }
      return '🪷 Afternoon dip — perfect for a nap, nature exposure, or a short NSDR session.';
    }

    if (energy === 'low') {
      return '📴 Wind down with calming routines or restorative chores. Protect recovery time.';
    }

    return '☕ Consider a slow, mindful break. No stimulation — just stillness and space.';
  }

  if (phase === 'complete') {
    if (energy === 'high') {
      return '🎯 Rhythm complete — but your energy’s still high. Reflect, journal, or use this bonus flow with intention.';
    }
    if (energy === 'low') {
      return '🛌 Rhythm complete. Time to restore: no screens, soft light, and rest.';
    }
    return '✅ You’ve completed your rhythm for today. Take a gentle walk, reflect, or begin unwinding.';
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
  console.log('[DEBUG] Hour:', '→', getTimeOfDay());


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
