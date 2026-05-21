"use client";
import React, { useEffect, useState } from 'react';

export default function NearbyHospitalsWidget() {
  const [hospitals, setHospitals] = useState<Array<{ name: string; address: string; distanceKm: number }>>([]);

  useEffect(() => {
    // lightweight sample fetch to the existing API if available, fallback to static
    async function load() {
      try {
        const res = await fetch('/api/hospitals/nearby?latitude=12.9716&longitude=77.5946&maxDistance=20');
        const data = await res.json();
        setHospitals(data.hospitals ?? []);
      } catch {
        setHospitals([
          { name: 'City General Hospital', address: 'Sector 21', distanceKm: 2.4 },
          { name: 'St Marys Clinic', address: 'MG Road', distanceKm: 4.1 },
        ]);
      }
    }
    load();
  }, []);

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nearby Hospitals</h3>
        <span className="text-xs text-slate-500">Local</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {hospitals.map((h, i) => (
          <li key={i} className="rounded-lg bg-white/30 p-3">
            <div className="font-medium">{h.name}</div>
            <div className="text-xs text-slate-500">{h.address} • {h.distanceKm?.toFixed(1)} km</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
