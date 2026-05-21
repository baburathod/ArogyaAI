"use client";
import React from 'react';

export default function AIHealthTips({ tips = [] }: { tips?: string[] }) {
  const sample = tips.length ? tips : [
    'Stay hydrated: aim for 2-3 liters daily.',
    'If fever > 38.5°C for more than 48 hours, seek care.',
    'Take medicines with food to reduce nausea.',
  ];

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Health Tips</h3>
        <span className="text-xs text-slate-500">Personalized</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {sample.map((t, i) => (
          <li key={i} className="rounded-lg bg-white/30 p-2">{t}</li>
        ))}
      </ul>
    </div>
  );
}
