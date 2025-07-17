// components/OnboardingModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/track';

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: 'Welcome to UltraDia 🌞',
      text: 'UltraDia helps you ride your natural energy waves. Let’s show you how.',
    },
    {
      title: 'Vibe Score 🎯',
      text: 'Each day starts with a Vibe Score based on HRV, sleep, and mood. It sets your rhythm intensity.',
    },
    {
      title: 'Cycles 🌀',
      text: 'Your day is divided into Peaks (focus) and Troughs (recovery). Follow the timer and prompts.',
    },
    {
      title: 'Get Started 🚀',
      text: 'Log your vibe, pick your cycles, and enter flow. We’ll track your streaks and progress.',
    },
  ];

  const next = () => {
    if (step === steps.length - 1) {
      localStorage.setItem('onboarding_complete', 'true');
      onClose();
    } else {
      setStep(step + 1);
    }
    trackEvent('onboarding_complete');

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
        <h2 className="text-xl font-bold text-blue-700">{steps[step].title}</h2>
        <p className="text-sm text-gray-700">{steps[step].text}</p>
        <button
          onClick={next}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700"
        >
          {step === steps.length - 1 ? 'Start My Rhythm' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
