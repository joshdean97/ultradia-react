'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, LogOut, Clock, Zap, Activity } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  const navItems = [
    { label: 'Log Record', href: '/log', icon: <Clock size={16} /> },
    { label: 'Ultradian', href: '/ultradian', icon: <Zap size={16} /> },
    { label: 'History', href: '/history', icon: <Activity size={16} /> },
  ];

  useEffect(() => {
    const cachedName = localStorage.getItem('user_name');
    if (cachedName) {
      setUser({ name: cachedName });
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name });
        } else {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } catch (err) {
        console.error('User fetch failed:', err);
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/ultradian" className="text-xl font-bold text-blue-600 tracking-wide">
          UltraDia
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden md:flex space-x-4 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link
                  href="/profile"
                  className={`flex items-center gap-1 px-3 py-2 rounded transition-all duration-200 ${
                    pathname === '/profile'
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <User size={16} /> {getFirstName(user.name)}
                </Link>
              </li>
            )}
          </ul>

          {user ? (
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              <LogOut size={16} className="inline-block" /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
