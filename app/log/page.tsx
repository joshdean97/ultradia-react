'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LogPage() {
  const router = useRouter()
  const [wakeTime, setWakeTime] = useState('')
  const [hrv, setHrv] = useState('')
  const [rhr, setRhr] = useState('')
  const [sleepDuration, setSleepDuration] = useState('')
  const [mood, setMood] = useState('😐')

  const submitRecord = async () => {
    try {
      const res = await fetch('http://localhost:5000/records', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wake_time: wakeTime,
          hrv: parseInt(hrv),
          rhr: parseInt(rhr),
          sleep_duration: parseFloat(sleepDuration),
          mood,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error submitting record')
      }

      toast.success('Daily record logged!')
      router.push('/ultradian')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Log Daily Record
        </h1>

        <div className="mb-4">
          <label className="block font-medium mb-1">Wake Time</label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">HRV (ms)</label>
          <input
            type="number"
            value={hrv}
            onChange={(e) => setHrv(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">RHR (bpm)</label>
          <input
            type="number"
            value={rhr}
            onChange={(e) => setRhr(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Sleep Duration (hrs)</label>
          <input
            type="number"
            step="0.1"
            value={sleepDuration}
            onChange={(e) => setSleepDuration(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Mood</label>
          <div className="flex justify-between text-2xl">
            {['😄', '🙂', '😐', '😴', '😤'].map((face) => (
              <button
                key={face}
                onClick={() => setMood(face)}
                className={`p-2 rounded-full transition ${
                  mood === face ? 'bg-blue-100 scale-110' : ''
                }`}
              >
                {face}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submitRecord}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Record
        </button>
      </div>
    </div>
  )
}
