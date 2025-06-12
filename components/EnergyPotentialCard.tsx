"use client";

import { useEffect, useState } from "react";

export default function EnergyPotentialCard() {
  const [vitalIndex, setVitalIndex] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [baseline, setBaseline] = useState<number | null>(null);
  const [todayHRV, setTodayHRV] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getPerformanceAdvice = (index: number | null) => {
    if (index === null)
      return { color: "text-gray-500", message: "No data available" };
    if (index > 120)
      return {
        color: "text-green-600",
        message: "Highly recovered — go for deep focus or intense training 💪",
      };
    if (index >= 90)
      return {
        color: "text-blue-600",
        message: "Stable performance — work as usual ⚖️",
      };
    return {
      color: "text-yellow-600",
      message: "Below baseline — rest or go low-intensity 🧘",
    };
  };

  useEffect(() => {
    const fetchEnergyPotential = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/energy-potential/", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not fetch energy potential");
        }

        setVitalIndex(data.vital_index);
        setBaseline(data.baseline_hrv);
        setTodayHRV(data.today_hrv);
        setStatus(data.status);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyPotential();
  }, []);

  const { color, message } = getPerformanceAdvice(vitalIndex);

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-3 text-blue-700">
        🔋 Energy Potential
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-2">
          <p className={`text-4xl font-bold text-center ${color}`}>
            {vitalIndex}
          </p>
          <p className="text-center text-sm text-gray-600 capitalize">
            Status: {status}
          </p>
          <p className={`text-center text-sm mt-2 ${color}`}>{message}</p>
          <div className="flex justify-between text-sm text-gray-700 mt-3">
            <p>
              <span className="font-medium">Today’s HRV:</span> {todayHRV}
            </p>
            <p>
              <span className="font-medium">Baseline HRV:</span> {baseline}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
