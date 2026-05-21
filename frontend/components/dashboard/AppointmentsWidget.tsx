"use client";
import React, { useEffect, useState } from 'react';
import { addOfflineQueueItem, getOfflineQueue, processOfflineQueue } from '../../lib/offline';

export default function AppointmentsWidget({ appts = [] }: { appts?: Array<{ id: string; title: string; when: string; with?: string }> }) {
  const sample = appts.length ? appts : [
    { id: 'a1', title: 'Dr. Sharma — Cardiology', when: '2026-05-25 10:00', with: 'City Heart Clinic' },
    { id: 'a2', title: 'Teleconsult — Diabetes', when: '2026-06-01 16:00', with: 'Arogya Telemed' },
  ];

  const [list, setList] = useState(sample);
  const [pending, setPending] = useState(0);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('');

  useEffect(() => {
    setPending(getOfflineQueue<any>('appointments').length);

    const handleOnline = () => {
      processOfflineQueue<any>('appointments', async (payload) => {
        try {
          const res = await fetch('/api/appointments', {
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

  function createAppointment() {
    const appt = { id: `local-${Date.now()}`, title: title || 'New Appointment', when: when || 'TBD', with: 'Self-scheduled' };
    setList((s) => [appt, ...s]);

    const payload = { title: appt.title, when: appt.when, createdAt: new Date().toISOString() };
    if (typeof window !== 'undefined' && !navigator.onLine) {
      addOfflineQueueItem('appointments', payload);
      setPending(getOfflineQueue<any>('appointments').length);
      setTitle('');
      setWhen('');
      return;
    }

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      addOfflineQueueItem('appointments', payload);
      setPending(getOfflineQueue<any>('appointments').length);
    });
    setTitle('');
    setWhen('');
  }

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Appointments</h3>
        <span className="text-xs text-slate-500">Upcoming</span>
      </div>

      <div className="mt-3 mb-2 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1 rounded-md border px-3 py-2 text-sm" />
        <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="When" className="w-36 rounded-md border px-3 py-2 text-sm" />
        <button onClick={createAppointment} className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Create</button>
      </div>

      <ul className="mt-2 space-y-2 text-sm text-slate-700">
        {list.map((a) => (
          <li key={a.id} className="rounded-lg bg-white/30 p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">{a.when} • {a.with}</div>
            </div>
            <button className="text-xs rounded-full bg-slate-900 px-3 py-1 text-white">Details</button>
          </li>
        ))}
      </ul>

      {pending > 0 && <div className="mt-3 text-xs text-amber-700">{pending} offline appointment{pending === 1 ? '' : 's'} pending sync</div>}
    </div>
  );
}
