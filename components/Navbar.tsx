'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const navItems = [
    { label: 'Log Record', href: '/log' },
    { label: 'Ultradian', href: '/ultradian' },
    { label: 'Profile', href: '/profile' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name });
        }
      } catch (err) {
        console.error('User fetch failed:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">UltraDia</span>

        <div className="flex items-center gap-6">
          <ul className="flex space-x-4 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              ☰ Menu
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  {user?.name ? `👤 ${user.name}` : 'Loading...'}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
