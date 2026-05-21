"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AssistantChat() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setDisclaimer(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const res = await fetch(`${apiBase}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? 'anonymous',
          query,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Assistant query failed');
      setResponse(data.response);
      setDisclaimer(data.disclaimer);
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Healthcare Assistant Chat</h2>
        <p className="text-sm text-[#425b43] mt-1">Ask ArogyaAI any health question in your preferred language.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm">Your question</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
            rows={3}
            required
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

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Asking...' : 'Ask AI'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {response && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Assistant Response</p>
          <div className="whitespace-pre-wrap text-sm text-slate-700">{response}</div>
          {disclaimer && <p className="mt-3 text-xs text-slate-500">{disclaimer}</p>}
        </div>
      )}
    </section>
  );
}
