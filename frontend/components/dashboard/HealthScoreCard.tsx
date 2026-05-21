"use client";
import React from 'react';

export default function HealthScoreCard({ score = 78 }: { score?: number }) {
  const color = score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-600' : 'text-rose-600';
  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-6 shadow-lg">
      <p className="text-sm text-slate-600">Health Score</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30">
          <span className={`text-2xl font-semibold ${color}`}>{score}</span>
        </div>
        <div>
          <p className="text-sm text-slate-700">Personalized health index based on vitals, medications and activity.</p>
          <p className="mt-2 text-xs text-slate-500">Higher is better. 80+ considered good.</p>
        </div>
      </div>
    </div>
  );
}
