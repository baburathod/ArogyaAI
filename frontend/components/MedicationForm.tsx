"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function MedicationForm() {
  const { data: session } = useSession();
  const [condition, setCondition] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
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
      const res = await fetch(`${apiBase}/api/ai/medication-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? 'anonymous',
          condition,
          symptoms,
          age: age ? Number(age) : undefined,
          allergies,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Medication recommendation failed');
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
        <h2 className="text-xl font-semibold">Medication Recommendations</h2>
        <p className="text-sm text-[#425b43] mt-1">AI-powered medication advice and lifestyle guidance.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">Condition</label>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
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

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">Allergies</label>
            <input
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border px-3 py-2 mt-1">
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="te">తె</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Generating...' : 'Get Recommendations'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Medication Guidance</p>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
