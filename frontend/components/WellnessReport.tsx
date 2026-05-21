"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function WellnessReport() {
  const { data: session, status } = useSession();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        const res = await fetch(`${apiBase}/api/ai/wellness-report/${session.user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load wellness report');
        setReport(data.report ?? data);
      } catch (err: any) {
        setError(err?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [session?.user?.id, status]);

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Wellness Report</h2>
        <p className="text-sm text-[#425b43] mt-1">See your latest health summary and pending alerts.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading wellness report...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {report && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Records</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{report.totalRecords ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Pending Alerts</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{report.pendingAlerts ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Latest Risk</p>
            <p className="mt-2 text-2xl font-semibold text-[#0c2e1e]">{report.riskLevel ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Recent Conditions</p>
            <div className="mt-2 text-sm text-slate-700">
              {report.recentConditions?.length ? report.recentConditions.join(', ') : 'No recent conditions available.'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
