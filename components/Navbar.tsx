'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, LogOut, Clock, Zap, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const navItems = [
    { label: 'Log Record', href: '/log', icon: <Clock size={16} /> },
    { label: 'Ultradian', href: '/ultradian', icon: <Zap size={16} /> },
    { label: 'Profile', href: '/profile', icon: <User size={16} /> },
    { label: 'History', href: '/history', icon: <Activity size={16} /> },
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
        <span className="text-xl font-bold text-blue-600 tracking-wide">UltraDia</span>

        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <Menu />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <ul className="flex space-x-4 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none flex items-center gap-1"
            >
              <User size={16} /> Menu
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-10 overflow-hidden"
                >
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.name ? `👤 ${user.name}` : 'Loading...'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t shadow-md overflow-hidden"
          >
            <ul className="flex flex-col text-sm font-medium">
              {navItems.map((item) => (
                <li key={item.href} className="border-b">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 transition ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t">
                <div className="px-4 py-2 text-sm text-gray-500">
                  {user?.name ? `👤 ${user.name}` : 'Loading...'}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}