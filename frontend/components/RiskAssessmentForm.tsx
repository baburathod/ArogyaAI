"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function RiskAssessmentForm() {
  const { data: session } = useSession();
  const [age, setAge] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState(5);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [spo2, setSpo2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const res = await fetch(`${apiBase}/api/ai/risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? 'anonymous',
          age: age ? Number(age) : undefined,
          symptoms,
          severity,
          medicalHistory,
          vitalSigns: {
            temperature: temperature ? Number(temperature) : undefined,
            heartRate: heartRate ? Number(heartRate) : undefined,
            bloodPressure: bloodPressure || undefined,
            spo2: spo2 ? Number(spo2) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Risk assessment failed');
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Health Risk Assessment</h2>
        <p className="text-sm text-[#425b43] mt-1">Estimate risk level and see recommended next steps.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Severity</label>
            <input
              type="number"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Blood Pressure</label>
            <input
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              placeholder="e.g., 120/80"
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm">Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="text-sm">Medical History</label>
          <textarea
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
            rows={2}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm">Heart Rate</label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Temperature</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">SpO2</label>
            <input
              type="number"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Assessing...' : 'Assess Risk'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Risk Assessment Result</p>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
