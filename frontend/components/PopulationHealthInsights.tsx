"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function PopulationHealthInsights() {
  const { data: session, status } = useSession();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading' || !session?.user?.role) return;
    if (session.user.role !== 'admin') {
      setError('Admin access required to view population health insights.');
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        const response = await fetch(`${apiBase}/api/ai/population-health`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unable to load insights');
        setInsights(data.insights ?? data);
      } catch (err: any) {
        setError(err?.message || 'Unknown error while fetching insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [session?.user?.role, status]);

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Population Health Insights</h2>
        <p className="text-sm text-[#425b43] mt-1">View aggregate diagnosis trends and critical cases across the platform.</p>
      </div>

      {status === 'loading' && <p className="text-sm text-slate-500">Checking permissions...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading insights...</p>}

      {insights && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Reporting Window</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{insights.period ?? 'Last 30 days'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Analyses</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{insights.totalAnalyses ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Critical Cases</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{insights.criticalCases ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">High Risk Users</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{insights.highRiskUsers ?? 0}</p>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Top Conditions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {insights.topConditions?.length ? (
                insights.topConditions.map((item: any, index: number) => (
                  <li key={index} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
                    <span>{item[0]}</span>
                    <span className="font-semibold text-[#0c2e1e]">{item[1]}</span>
                  </li>
                ))
              ) : (
                <li>No condition data available.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
