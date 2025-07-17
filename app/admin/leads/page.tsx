'use client';

import { useEffect, useState } from 'react';

type Lead = {
  id: number;
  email: string;
  name: string;
  timestamp: string;
};


export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:5000/api/admin/leads', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setLeads)
      .catch(() => setError('Failed to load leads.'));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📬 Leads</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
        <table className="min-w-full text-sm">
        <thead>
        <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Created</th>
        </tr>
        </thead>
        <tbody>
        {leads.map((l) => (
            <tr key={l.id}>
            <td>{l.id}</td>
            <td>{l.email}</td>
            <td>{l.name}</td>
            <td>{new Date(l.timestamp).toLocaleDateString()}</td>
            </tr>
        ))}
        </tbody>
        </table>
      </div>
    </main>
  );
}
