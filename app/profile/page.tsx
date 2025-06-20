'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    peak_duration: 90,
    trough_duration: 20,
    grog_duration: 20,
    cycles_count: 4,
  });
  const [message, setMessage] = useState('');
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('http://localhost:5000/users/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name,
          email: data.email,
          peak_duration: data.peak_duration,
          trough_duration: data.trough_duration,
          grog_duration: data.grog_duration,
          cycles_count: data.cycles_count,
        });
        setUserId(data.id);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === 'email' || name === 'name' ? value : parseInt(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const res = await fetch(`http://localhost:5000/users/${userId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        peak_duration: profile.peak_duration,
        trough_duration: profile.trough_duration,
        morning_grog: profile.grog_duration,
        cycles: profile.cycles_count,
      }),
    });

    if (res.ok) {
      setMessage('Profile updated successfully.');
      setShowCheck(true);
      setTimeout(() => {
        setShowCheck(false);
        router.refresh(); // Auto-refresh current view
        router.push('/ultradian'); // Navigate to updated view
      }, 1500);
    } else {
      setMessage('Failed to update profile.');
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    const confirmed = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;

    const res = await fetch(`http://localhost:5000/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      alert('Account deleted.');
      router.push('/register');
    } else {
      alert('Failed to delete account.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Rhythm Preferences</h1>

        {message && (
          <div className="mb-4 text-sm text-center text-green-600 flex items-center justify-center gap-2">
            {message} {showCheck && <span className="text-green-600 text-xl">✓</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Peak Duration (minutes)', name: 'peak_duration', type: 'number' },
            { label: 'Trough Duration (minutes)', name: 'trough_duration', type: 'number' },
            { label: 'Morning Grog (minutes)', name: 'grog_duration', type: 'number' },
            { label: 'Number of Cycles', name: 'cycles_count', type: 'number' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-gray-800 focus:ring-2 focus:ring-blue-500"
                value={profile[name as keyof typeof profile] ?? ''}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>

        <button
          onClick={handleDelete}
          className="mt-6 w-full text-sm text-red-600 underline hover:text-red-800"
        >
          Delete My Account
        </button>
      </div>
    </main>
  );
}
