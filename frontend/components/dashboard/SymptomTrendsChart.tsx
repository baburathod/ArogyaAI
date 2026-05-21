"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const sample = [
  { date: '2026-05-01', cough: 5, fever: 3, pain: 6 },
  { date: '2026-05-05', cough: 8, fever: 4, pain: 7 },
  { date: '2026-05-09', cough: 6, fever: 2, pain: 5 },
  { date: '2026-05-13', cough: 7, fever: 3, pain: 4 },
  { date: '2026-05-17', cough: 4, fever: 3, pain: 3 },
  { date: '2026-05-21', cough: 3, fever: 2, pain: 2 },
];

export default function SymptomTrendsChart({ data: initialData = sample }: { data?: any[] }) {
  const [data, setData] = React.useState<any[]>(initialData);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/analytics/symptoms');
        const json = await res.json();
        if (!cancelled && json?.data) setData(json.data);
      } catch {
        // keep sample
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4 h-64">
      <h3 className="text-sm font-semibold">Symptom Trends</h3>
      <div className="mt-2 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cough" stroke="#0f766e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fever" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pain" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
