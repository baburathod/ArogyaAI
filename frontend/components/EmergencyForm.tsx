"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmergencyForm() {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState(5);
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
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
      const res = await fetch(`${apiBase}/api/ai/detect-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? 'anonymous',
          symptoms,
          severity,
          vitalSigns: {
            temperature: temperature ? Number(temperature) : undefined,
            heartRate: heartRate ? Number(heartRate) : undefined,
            bloodPressure: bloodPressure || undefined,
            respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
          },
          location: location ? { address: location, latitude: 0, longitude: 0 } : undefined,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Emergency detection failed');
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
        <h2 className="text-xl font-semibold">Emergency Detection</h2>
        <p className="text-sm text-[#425b43] mt-1">Quickly analyze red flags from symptoms and vitals.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
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

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm">Severity (1-10)</label>
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
            <label className="text-sm">Temperature (°C)</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Heart Rate (bpm)</label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm">Blood Pressure</label>
            <input
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              placeholder="e.g., 120/80"
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Respiratory Rate</label>
            <input
              type="number"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or village address"
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border px-3 py-2 mt-1">
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="te">తె</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Checking...' : 'Detect Emergency'}
          </button>
          <button type="button" onClick={() => {
            setSymptoms('');
            setSeverity(5);
            setTemperature('');
            setHeartRate('');
            setBloodPressure('');
            setRespiratoryRate('');
            setLocation('');
            setResult(null);
            setError(null);
          }} className="button button-ghost">
            Clear
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Emergency Result</p>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
