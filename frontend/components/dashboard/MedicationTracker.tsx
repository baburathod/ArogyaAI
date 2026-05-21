"use client";
import React, { useEffect, useState } from 'react';
import { addOfflineQueueItem, getOfflineQueue, processOfflineQueue } from '../../lib/offline';

export default function MedicationTracker({ meds = [] }: { meds?: Array<{ id: string; name: string; dose: string; nextDose: string }> }) {
  const sample = meds.length ? meds : [
    { id: 'm1', name: 'Metformin', dose: '500mg', nextDose: 'Today 18:00' },
    { id: 'm2', name: 'Atorvastatin', dose: '20mg', nextDose: 'Tomorrow 09:00' },
  ];

  const [pending, setPending] = useState(0);

  useEffect(() => {
    setPending(getOfflineQueue<any>('medication-taken').length);

    const handleOnline = () => {
      processOfflineQueue<any>('medication-taken', async (payload) => {
        // try to send to backend; return true on success
        try {
          const res = await fetch('/api/medications/taken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          return res.ok;
        } catch {
          return false;
        }
      }).then((remaining) => setPending(remaining));
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  async function markTaken(med: { id: string; name: string }) {
    const payload = { medId: med.id, name: med.name, takenAt: new Date().toISOString() };
    if (typeof window !== 'undefined' && !navigator.onLine) {
      addOfflineQueueItem('medication-taken', payload);
      setPending(getOfflineQueue<any>('medication-taken').length);
      return;
    }

    try {
      await fetch('/api/medications/taken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      addOfflineQueueItem('medication-taken', payload);
      setPending(getOfflineQueue<any>('medication-taken').length);
    }
  }

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Medication Tracking</h3>
        <span className="text-xs text-slate-500">Adherence</span>
      </div>
      <ul className="mt-3 space-y-3">
        {sample.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-xl bg-white/30 p-3">
            <div>
              <div className="font-medium text-slate-700">{m.name}</div>
              <div className="text-xs text-slate-500">{m.dose}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500">Next: {m.nextDose}</div>
              <button onClick={() => markTaken(m)} className="text-xs rounded-full bg-emerald-600 px-3 py-1 text-white">Mark taken</button>
            </div>
          </li>
        ))}
      </ul>

      {pending > 0 && (
        <div className="mt-3 text-xs text-amber-700">{pending} offline medication record{pending === 1 ? '' : 's'} pending sync</div>
      )}
    </div>
  );
}
