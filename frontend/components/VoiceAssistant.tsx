"use client";

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

const languageOptions = [
  { value: 'en', label: 'English', locale: 'en-US', native: 'English' },
  { value: 'hi', label: 'Hindi', locale: 'hi-IN', native: 'हिन्दी' },
  { value: 'te', label: 'Telugu', locale: 'te-IN', native: 'తెలుగు' },
];

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

const getSpeechSynthesisSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const speakText = (text: string, locale: string) => {
  if (!getSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = 1;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((voice) => voice.lang.startsWith(locale)) || voices.find((voice) => voice.lang.startsWith('en'));
  if (matchedVoice) utterance.voice = matchedVoice;

  window.speechSynthesis.speak(utterance);
};

export default function VoiceAssistant() {
  const { data: session } = useSession();
  const recognitionRef = useRef<any>(null);
  const [language, setLanguage] = useState('en');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageOptions.find((option) => option.value === language)?.locale || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i][0];
        if (event.results[i].isFinal) {
          finalTranscript += result.transcript;
        } else {
          interimTranscript += result.transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(event.error || 'Speech recognition error');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setSupported(true);
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageOptions.find((option) => option.value === language)?.locale || 'en-US';
    }
  }, [language]);

  useEffect(() => {
    if (!getSpeechSynthesisSupported()) {
      setVoiceReady(false);
      return;
    }

    const populateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoiceReady(voices.length > 0);
    };

    window.speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const toggleListening = () => {
    setError(null);
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      return;
    }

    setTranscript('');
    setResponse(null);
    setDisclaimer(null);
    setError(null);
    setListening(true);
    recognitionRef.current.start();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setDisclaimer(null);

    if (!transcript.trim()) {
      setError('Please speak or type a question first.');
      setLoading(false);
      return;
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const res = await fetch(`${apiBase}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? 'anonymous',
          query: transcript,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Voice assistant failed');
      setResponse(data.response);
      setDisclaimer(data.disclaimer);
      speakText(data.response, languageOptions.find((option) => option.value === language)?.locale || 'en-US');
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Multilingual Voice Assistant</h2>
        <p className="text-sm text-[#425b43] mt-1">
          Speak a healthcare query in English, Hindi, or Telugu and receive an AI voice response.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm" htmlFor="voice-language">
            Voice language
          </label>
          <select
            id="voice-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.native} ({option.label})
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium">Speech input</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={toggleListening}
              disabled={!supported}
              className="button button-secondary"
              aria-pressed={listening}
            >
              {listening ? 'Stop Listening' : 'Start Speaking'}
            </button>
            <button
              type="submit"
              disabled={loading || !transcript.trim()}
              className="button button-primary"
            >
              {loading ? 'Processing...' : 'Send Voice Query'}
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {supported
              ? 'Tap Start, ask your question clearly, then stop listening to submit.'
              : 'Speech recognition is not supported in this browser. Use the text box below instead.'}
          </p>
        </div>

        <div>
          <label className="text-sm" htmlFor="voice-transcript">
            Transcript / typed question
          </label>
          <textarea
            id="voice-transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full rounded-md border px-3 py-2 mt-1"
            rows={4}
            placeholder="Your spoken question will appear here..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">Voice support</p>
            <p className="mt-2 text-sm text-slate-700">
              {supported ? 'Speech recognition ready.' : 'Speech recognition unavailable.'}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {voiceReady ? 'Voice playback ready.' : 'Voice playback may take a moment to initialize.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">Accessible workflow</p>
            <p className="mt-2 text-sm text-slate-700">
              Use the keyboard and screen reader-friendly buttons to capture audio and hear AI guidance.
            </p>
          </div>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {response && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">AI Assistant Response</p>
          <div className="whitespace-pre-wrap text-sm text-slate-700 mt-2">{response}</div>
          {disclaimer && <p className="mt-3 text-xs text-slate-500">{disclaimer}</p>}
          <button
            type="button"
            onClick={() => speakText(response, languageOptions.find((option) => option.value === language)?.locale || 'en-US')}
            className="mt-4 inline-flex rounded-full bg-[#0c2e1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#092215]"
          >
            Repeat response
          </button>
        </div>
      )}
    </section>
  );
}
