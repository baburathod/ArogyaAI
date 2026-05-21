"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { addOfflineQueueItem, getOfflineQueue, processOfflineQueue } from "../lib/offline";

type AIRequest = {
  userId: string;
  symptoms: string;
  duration: string;
  severity: number;
  language: string;
};

export default function AIForm() {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("arogyaai-ai-form");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setSymptoms(draft.symptoms ?? "");
        setDuration(draft.duration ?? "");
        setSeverity(draft.severity ?? 5);
        setLanguage(draft.language ?? "en");
      } catch {
        // ignore invalid draft
      }
    }

    setPendingCount(getOfflineQueue<AIRequest>("ai-symptom").length);

    const handleOnline = () => {
      setError(null);
      syncPendingRequests();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "arogyaai-ai-form",
      JSON.stringify({ symptoms, duration, severity, language })
    );
  }, [symptoms, duration, severity, language]);

  async function syncPendingRequests() {
    const remaining = await processOfflineQueue<AIRequest>("ai-symptom", async (payload) => {
      const response = await fetch("/api/ai/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.ok;
    });

    setPendingCount(remaining);

    if (remaining === 0) {
      setResult({ message: "All offline AI symptom requests were synced." });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload: AIRequest = {
      userId: session?.user?.id || "anonymous",
      symptoms,
      duration,
      severity,
      language,
    };

    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        addOfflineQueueItem("ai-symptom", payload);
        setPendingCount(getOfflineQueue<AIRequest>("ai-symptom").length);
        setError("You are offline. The request has been saved and will sync when online.");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const res = await fetch(`${apiBase}/api/ai/analyze-symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI request failed");
      setResult(data);
    } catch (err: any) {
      if (typeof window !== "undefined" && !navigator.onLine) {
        addOfflineQueueItem("ai-symptom", payload);
        setPendingCount(getOfflineQueue<AIRequest>("ai-symptom").length);
        setError("You are offline. The request has been saved and will sync when online.");
      } else {
        setError(err?.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold">AI Symptom Analysis</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="ai-symptoms" className="text-sm">Symptoms</label>
          <textarea
            id="ai-symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
            rows={4}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="ai-duration" className="text-sm">Duration</label>
            <input
              id="ai-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
              placeholder="e.g., 2 days"
            />
          </div>
          <div>
            <label htmlFor="ai-severity" className="text-sm">Severity (1-10)</label>
            <input
              id="ai-severity"
              type="number"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label htmlFor="ai-language" className="text-sm">Language</label>
            <select
              id="ai-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border px-3 py-2 mt-1"
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="te">తె</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSymptoms("");
              setDuration("");
              setSeverity(5);
              setResult(null);
              setError(null);
            }}
            className="button button-ghost"
          >
            Reset
          </button>
        </div>
      </form>

      {pendingCount > 0 && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          {pendingCount} offline AI request{pendingCount === 1 ? '' : 's'} will sync when you are back online.
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-arogya-100 bg-arogya-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">AI Summary</p>
                <p className="font-semibold">Risk Level: {result.severity || 'unknown'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
