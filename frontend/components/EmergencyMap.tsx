"use client";

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const markerRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

if (typeof window !== 'undefined' && L?.Icon?.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerRetinaUrl,
    iconUrl: markerUrl,
    shadowUrl,
  });
}

interface EmergencyMapProps {
  center?: [number, number];
  markers?: Array<{ id: string; lat: number; lng: number; title: string; description?: string; type?: string }>;
  radius?: number;
}

export default function EmergencyMap({ center, markers = [], radius = 5000 }: EmergencyMapProps) {
  const mapCenter = useMemo<[number, number]>(() => center || [20.5937, 78.9629], [center]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={mapCenter} zoom={center ? 13 : 5} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {center && <Circle center={mapCenter} radius={radius} pathOptions={{ color: '#0c2e1e', fillOpacity: 0.1 }} />}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{marker.title}</div>
                <div>{marker.type ?? 'Emergency'}</div>
                {marker.description && <div>{marker.description}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
