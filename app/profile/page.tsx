'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { trackEvent } from '@/lib/track';
import { API_BASE_URL } from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  peak_duration: number;
  trough_duration: number;
  grog_duration: number;
  cycles_count?: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    name: '',
    email: '',
    peak_duration: 0,
    trough_duration: 0,
    grog_duration: 0,
    cycles_count: 0,
  });
  const [status, setStatus] = useState('');
  const [editInfo, setEditInfo] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: UserProfile) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${profile.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setStatus('Saved!');
        trackEvent('profile_updated', { ...profile });

        setTimeout(() => setStatus(''), 2000);
      }
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${profile.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        localStorage.removeItem("access_token");
        window.location.href = '/login';
        trackEvent('account_deleted');
      }
    } catch (err) {
      console.error("Error deleting profile", err);
    }
  };

  const totalMinutes =
    Number(profile.grog_duration || 0) +
    Number(profile.cycles_count || 0) *
      (Number(profile.peak_duration || 0) + Number(profile.trough_duration || 0));

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 pt-10">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow space-y-6">
        <h1 className="text-3xl font-semibold text-blue-700 text-center">Rhythm Preferences</h1>

        <div className="space-y-5">
          <div className="relative">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg text-gray-800 px-3 py-2 mt-1 text-sm placeholder-gray-600"
              disabled={!editInfo}
              placeholder="Enter your name"
            />
            <button
              onClick={() => setEditInfo((prev) => !prev)}
              className="absolute right-2 top-7 text-gray-500 hover:text-gray-700"
              title="Edit name/email"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 text-gray-800 py-2 mt-1 text-sm placeholder-gray-600"
              disabled={!editInfo}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Peak Duration (minutes)</label>
            <input
              type="number"
              name="peak_duration"
              value={profile.peak_duration || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 text-gray-800 py-2 mt-1 text-sm placeholder-gray-600"
              placeholder="e.g. 90"
            />
            <p className="text-xs text-gray-500 mt-1">💡 90 min blocks work well for deep focus</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Trough Duration (minutes)</label>
            <input
              type="number"
              name="trough_duration"
              value={profile.trough_duration || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg text-gray-800 px-3 py-2 mt-1 text-sm placeholder-gray-600"
              placeholder="e.g. 20"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Shorter troughs help reset attention</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Morning Grog (minutes)</label>
            <input
              type="number"
              name="grog_duration"
              value={profile.grog_duration || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2 mt-1 text-sm placeholder-gray-600"
              placeholder="e.g. 30"
            />
            <p className="text-xs text-gray-500 mt-1">☁️ Time to gently ease into the day</p>
          </div>

          <p className="text-sm text-center text-gray-600">
            ⏱️ Approx. total session time: <span className="font-semibold text-gray-700">{totalMinutes} minutes</span>
          </p>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Save Changes
          </button>

          {status && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-green-600 font-medium text-sm"
            >
              ✔ {status}
            </motion.p>
          )}

          <button
            onClick={handleDelete}
            className="w-full text-red-600 text-sm font-medium mt-4 hover:underline"
          >
            Delete My Account
          </button>

          <button
            type="button"
            onClick={() =>
              setProfile({
                ...profile,
                peak_duration: 90,
                trough_duration: 20,
                grog_duration: 30,
              })
            }
            className="text-xs text-blue-500 underline mt-2 hover:text-blue-700 text-center w-full"
          >
            Reset to Default Rhythm
          </button>
        </div>
      </div>
    </main>
  );
}
