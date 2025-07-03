'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("access_token");

  const checkSession = async () => {
    if (!token) return setCheckingSession(false);

    try {
      const res = await fetch('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const r = await fetch('http://localhost:5000/api/records/today/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push(r.ok ? '/ultradian' : '/log');
      }
    } catch {
      // no-op
    } finally {
      setCheckingSession(false);
    }
  };

  checkSession();
}, [router]);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      localStorage.setItem('access_token', data.access_token); // ✅ Save token

      const token = data.access_token;
      const r = await fetch('http://localhost:5000/api/records/today/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push(r.ok ? '/ultradian' : '/log');
    } else {
      setError(data.error || 'Login failed');
    }
  } catch (err) {
    setError('Something went wrong');
  }
};

 if (checkingSession) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-sm">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 p-8 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">UltraDia Login</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
