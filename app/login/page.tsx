'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { trackEvent } from '@/lib/track';
import { API_BASE_URL } from '@/lib/api';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const checkSession = async () => {
      if (!token) return setCheckingSession(false);

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const r = await fetch(`${API_BASE_URL}/api/records/today/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          router.push(r.ok ? '/ultradian' : '/log');
        }
      } catch {
        // silent fail
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('access_token', data.access_token);

        toast.success('Login successful!');
        trackEvent('login_success', { email });

        const r = await fetch(`${API_BASE_URL}/api/records/today/`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });

        router.push(r.ok ? '/ultradian' : '/log');
      } else {
        toast.error(data.error || 'Login failed');
        setError(data.error || 'Login failed');
        trackEvent('login_error', { error: data.error });
      }
    } catch (err) {
      toast.error('Something went wrong');
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            className={`w-full text-white py-2 rounded-md transition ${
              isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500 my-2">or</p>
          <a
            href="${API_BASE_URL}/api/auth/login/google"
            className="flex items-center justify-center gap-2 w-full bg-white text-gray-800 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition shadow-sm"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.3-1.4-34-4-50.2H272v95h146.9c-6.4 34.6-25.8 63.9-55.1 83.4v68h89c52.2-48 80.7-118.8 80.7-196.2z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c73.7 0 135.6-24.5 180.8-66.7l-89-68c-24.8 16.6-56.5 26.2-91.8 26.2-70.7 0-130.6-47.9-152-112.2H27.5v70.6C72.3 483.5 165.3 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M120 323.6c-10.4-30.6-10.4-63.8 0-94.4V158.5h-92.5C3.6 203.6-6.7 258.2 4 312.5l92 70.5 24-59.4z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c39.9-.6 78.4 13.7 108 40.1l81-81C417.6 22.7 346.3-1.3 272 0 165.3 0 72.3 60.8 27.5 158.5l92.5 70.6C141.4 155.6 201.3 107.7 272 107.7z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>
        </div>

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
