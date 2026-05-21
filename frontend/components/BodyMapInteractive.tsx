"use client";

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

type AnalysisData = {
  analysis: string;
  possibleConditions: Array<{ name: string; likelihood: string; reasoning: string }>;
  recommendations: string[];
  emergencyWarning: boolean;
  emergencySignals: string[];
  riskLevel: string;
  followUpNeeded: boolean;
};

const regions = [
  { id: 'head', label: 'Head', description: 'Headaches, dizziness, vision, and facial pain.' },
  { id: 'chest', label: 'Chest', description: 'Chest discomfort, breathing issues, or heart-related symptoms.' },
  { id: 'stomach', label: 'Stomach', description: 'Abdominal pain, nausea, cramps, or digestion issues.' },
  { id: 'arms', label: 'Arms', description: 'Arm pain, numbness, weakness, or swelling.' },
  { id: 'legs', label: 'Legs', description: 'Leg cramps, swelling, mobility, or circulation problems.' },
];

export default function BodyMapInteractive() {
  const { data: session, status } = useSession();
  const [selectedRegion, setSelectedRegion] = useState('chest');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState(5);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading') {
    return <div className="card p-6">Loading session...</div>;
  }

  if (!session?.user) {
    return (
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Sign in to use the Body Map</h2>
        <p className="text-sm text-slate-600">Please sign in to access your personalized body region symptom assistant.</p>
        <button onClick={() => signIn()} className="button button-primary">Sign in</button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!symptoms.trim()) {
      setError('Please describe your symptoms for the selected body region.');
      setLoading(false);
      return;
    }

    const payload = {
      userId: session?.user?.id || 'anonymous',
      region: selectedRegion,
      symptoms,
      duration,
      severity,
      language,
    };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const res = await fetch(`${apiBase}/api/ai/body-region-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Body map analysis failed.');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const regionInfo = regions.find((region) => region.id === selectedRegion);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-arogya-700">Phase 9: Interactive Body Map</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">Body Region Symptom Analysis</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#3a5d42]">
              Tap the area of the body that feels uncomfortable and describe your symptoms for targeted AI guidance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="card space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Tap a region</h2>
            <p className="text-sm text-slate-600">Select one body region to focus symptom capture and get AI feedback.</p>

            <div className="relative mt-6 mx-auto h-[420px] max-w-[320px] rounded-[32px] bg-gradient-to-b from-[#eefcf3] to-[#f5f9f6] p-6 shadow-inner">
              <div className="absolute inset-x-6 top-6 rounded-[32px] bg-white/80 p-4 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-700">Interactive body map</p>
              </div>
              <button
                type="button"
                className={`absolute left-1/2 top-12 w-24 -translate-x-1/2 rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedRegion === 'head' ? 'bg-arogya-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setSelectedRegion('head')}
              >
                Head
              </button>
              <button
                type="button"
                className={`absolute left-1/2 top-32 w-28 -translate-x-1/2 rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedRegion === 'chest' ? 'bg-arogya-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setSelectedRegion('chest')}
              >
                Chest
              </button>
              <button
                type="button"
                className={`absolute left-1/2 top-52 w-28 -translate-x-1/2 rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedRegion === 'stomach' ? 'bg-arogya-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setSelectedRegion('stomach')}
              >
                Stomach
              </button>
              <button
                type="button"
                className={`absolute left-8 top-44 w-24 rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedRegion === 'arms' ? 'bg-arogya-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setSelectedRegion('arms')}
              >
                Arms
              </button>
              <button
                type="button"
                className={`absolute right-8 top-44 w-24 rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedRegion === 'legs' ? 'bg-arogya-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setSelectedRegion('legs')}
              >
                Legs
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Selected region</h3>
            <p className="mt-2 text-sm text-slate-600">{regionInfo?.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="body-map-symptoms" className="text-sm font-medium text-slate-800">Describe your symptoms</label>
              <textarea
                id="body-map-symptoms"
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-arogya-500 focus:outline-none"
                placeholder={`Describe the ${regionInfo?.label.toLowerCase()} symptoms here...`}
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="body-map-duration" className="text-sm font-medium text-slate-800">How long</label>
                <input
                  id="body-map-duration"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="e.g. 2 days"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-arogya-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="body-map-severity" className="text-sm font-medium text-slate-800">Severity (1–10)</label>
                <input
                  id="body-map-severity"
                  type="number"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(event) => setSeverity(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-arogya-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="body-map-language" className="text-sm font-medium text-slate-800">Language</label>
                <select
                  id="body-map-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-arogya-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="te">తెలుగు</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={loading} className="button button-primary">
                {loading ? 'Analyzing...' : 'Analyze body region'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSymptoms('');
                  setDuration('');
                  setSeverity(5);
                  setResult(null);
                  setError(null);
                }}
                className="button button-ghost"
              >
                Reset form
              </button>
            </div>

            {error ? <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">{error}</div> : null}
          </form>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold">Body Map Result</h2>
            <p className="mt-2 text-sm text-slate-600">Review AI assessment, risk feedback, and condition suggestions for the selected body region.</p>
          </div>

          {result ? (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Selected region</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">AI Analysis</h3>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{result.analysis}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f8faf9] p-4">
                    <p className="text-sm font-semibold text-slate-900">Risk Level</p>
                    <p className="mt-2 text-2xl font-semibold text-arogya-700">{result.riskLevel}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf9] p-4">
                    <p className="text-sm font-semibold text-slate-900">Emergency warning</p>
                    <p className="mt-2 text-sm text-slate-700">{result.emergencyWarning ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Possible conditions</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {result.possibleConditions.length > 0 ? (
                      result.possibleConditions.map((condition) => (
                        <li key={condition.name} className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="font-semibold">{condition.name}</p>
                          <p className="text-xs text-slate-500">Likelihood: {condition.likelihood}</p>
                          <p className="mt-1 text-sm text-slate-600">{condition.reasoning}</p>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-500">No conditions could be identified.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {result.recommendations.length > 0 ? (
                      result.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)
                    ) : (
                      <li>No recommendations available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Select a body region, describe your symptoms, and submit the form to see focused AI guidance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
