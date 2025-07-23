'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';


type User = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setError('Failed to load users.'));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 All Users</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
        <table className="min-w-full text-sm">
          <thead><tr><th>ID</th><th>Email</th><th>Admin</th><th>Created</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.is_admin ? '✅' : '—'}</td>
                <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
