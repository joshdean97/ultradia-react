'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import FocusStreakOverview from '@/components/FocusStreakOverview';
import TableSkeleton from '@/components/TableSkeleton';
import { trackEvent } from '@/lib/track';


export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [baselineHRV, setBaselineHRV] = useState<number | null>(null);
  const recordsPerPage = 5;

  useEffect(() => {
  const fetchRecords = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch('http://localhost:5000/api/records/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

    const data = await res.json();
    // ... (no changes to the rest)
        console.log("Fetched record data:", data);

        const rawRecords = Array.isArray(data)
  ? data
  : Array.isArray(data.records)
    ? data.records
    : [];

if (!Array.isArray(rawRecords)) {
  console.warn("❌ records is not an array:", rawRecords);
  setRecords([]);
  return;
}


        if (rawRecords.length === 0) {
          console.warn("⚠️ No records returned from /records/");
        }

        const sortedRecords = (rawRecords || []).sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecords(sortedRecords);
        trackEvent('view_history', { recordCount: sortedRecords.length });


        if (sortedRecords.length > 1) {
          const recent = sortedRecords.slice(1, 8).map((r: any) => r.hrv).filter((h: any) => h != null);
          const baseline = recent.reduce((acc, h) => acc + h, 0) / recent.length;
          setBaselineHRV(baseline);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const goToUltradian = async (record: any) => {
    const token = localStorage.getItem("access_token");
    const date = new Date(record.date);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const res = await fetch(`http://localhost:5000/api/ultradian/?y=${y}&m=${m}&d=${d}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert('No ultradian data exists for this date.');
      return;
    }

    sessionStorage.setItem('wake_time', record.wake_time);
    trackEvent('view_past_cycle', { date: record.date });

    router.push(`/ultradian?y=${y}&m=${m}&d=${d}`);
  };

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = (page - 1) * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  function groupedByMonth(records: any[]) {
    const groups: Record<string, any[]> = {};
    for (const record of records) {
      const d = new Date(record.date);
      const monthKey = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(record);
    }
    return Object.entries(groups);
  }

  function getHRVColor(hrv: number) {
    if (baselineHRV === null) return 'text-gray-600';
    const index = (hrv / baselineHRV) * 100;
    if (index > 110) return 'text-green-600 font-semibold';
    if (index >= 90) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  }

  function getHRVTooltip(hrv: number) {
    if (baselineHRV === null) return 'Baseline not available';
    const index = (hrv / baselineHRV) * 100;
    if (index > 110) return 'HRV is significantly above baseline';
    if (index >= 90) return 'HRV is near baseline';
    return 'HRV is below baseline';
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">📅 Daily Record History</h1>
        <FocusStreakOverview />

        {loading ? (
           <>
    <TableSkeleton rows={5} />
  </>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <table className="w-full text-sm border border-gray-200">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Wake Time</th>
                  <th className="py-2 px-3 text-left">HRV (ms)</th>
                  <th className="py-2 px-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  groupedByMonth(currentRecords).map(([month, records]) => (
                    <React.Fragment key={month}>
                      <tr className="bg-gray-200">
                        <td colSpan={4} className="py-2 px-3 font-semibold text-gray-700">
                          {month}
                        </td>
                      </tr>
                      {records.map((r: any, idx: number) => (
                        <tr
                          key={r.date + idx}
                          className={`border-b border-gray-200 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="py-2 px-3 text-gray-800">{r.date}</td>
                          <td className="py-2 px-3 text-gray-800">{r.wake_time}</td>
                          <td
                            className={`py-2 px-3 ${getHRVColor(r.hrv)}`}
                            title={getHRVTooltip(r.hrv)}
                          >
                            {r.hrv}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => goToUltradian(r)}
                              className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-6 text-sm">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/ultradian')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Today’s Ultradian View
          </button>
        </div>
      </div>
    </main>
  );
}
