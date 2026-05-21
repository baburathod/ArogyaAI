"use client";
import React from 'react';

export default function EmergencyAlerts({ alerts = [] }: { alerts?: Array<{ id: string; title: string; time: string; severity?: string }> }) {
  const sample = alerts.length ? alerts : [
    { id: '1', title: 'Ambulance dispatched to Sector 14', time: '5m ago', severity: 'critical' },
    { id: '2', title: 'Nearby hospital reporting high load', time: '12m ago', severity: 'high' },
  ];

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Emergency Alerts</h3>
        <span className="text-xs text-slate-500">Live</span>
      </div>
      <ul className="mt-3 space-y-3">
        {sample.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <div className={`mt-1 h-3 w-3 rounded-full ${a.severity === 'critical' ? 'bg-rose-600' : a.severity === 'high' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <div>
              <div className="font-medium text-slate-700">{a.title}</div>
              <div className="text-xs text-slate-500">{a.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
