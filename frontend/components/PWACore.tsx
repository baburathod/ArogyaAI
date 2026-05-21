"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWACore() {
  const [isOnline, setIsOnline] = useState(true);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [statusMessage, setStatusMessage] = useState('Preparing offline mode...');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setStatusMessage('Back online. Offline data will sync automatically.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusMessage('Offline mode active. Cached workflows still work.');
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallAvailable(true);
    };

    const handleAppInstalled = () => {
      setInstallAvailable(false);
      setDeferredPrompt(null);
      setStatusMessage('ArogyaAI installed successfully.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => setStatusMessage('Service worker registered. Offline caching enabled.'))
        .catch(() => setStatusMessage('Unable to register service worker. Offline caching unavailable.'));
    } else {
      setStatusMessage('Service workers are not supported in this browser.');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setStatusMessage('Thanks for installing ArogyaAI.');
    } else {
      setStatusMessage('Installation dismissed. You can install the app later.');
    }
    setInstallAvailable(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur sm:right-6">
      <div className="space-y-2 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Offline-ready healthcare app</p>
        <p>{statusMessage}</p>
        <p className={`text-xs ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
          {isOnline ? 'Online' : 'Offline mode active. Pending actions will sync automatically.'}
        </p>
        {installAvailable && (
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
