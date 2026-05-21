"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { addOfflineQueueItem, getOfflineQueue, processOfflineQueue } from '../lib/offline';

const EmergencyMap = dynamic(() => import('./EmergencyMap'), { ssr: false });

const defaultContact = { name: '', phone: '', relation: '' };

type SOSPayload = {
  userId: string;
  type: string;
  severity: string;
  description: string;
  location: { latitude: number; longitude: number; address: string };
  emergencyContacts: Array<{ name: string; phone: string; relation: string }>;
};

export default function EmergencySOS() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('Current location');
  const [type, setType] = useState('medical_emergency');
  const [severity, setSeverity] = useState('critical');
  const [description, setDescription] = useState('I need immediate help.');
  const [statusMessage, setStatusMessage] = useState('Ready to trigger SOS.');
  const [hospitals, setHospitals] = useState<Array<{ name: string; address: string; distanceKm: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(defaultContact);
  const [result, setResult] = useState<string | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const mapMarkers = useMemo(() => {
    if (latitude !== null && longitude !== null) {
      return [{ id: 'you', lat: latitude, lng: longitude, title: 'Your SOS Location', description: address, type: 'SOS' }];
    }
    return [];
  }, [latitude, longitude, address]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = window.localStorage.getItem('arogyaai-sos-form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.latitude) setLatitude(parsed.latitude);
        if (parsed.longitude) setLongitude(parsed.longitude);
        setAddress(parsed.address ?? 'Current location');
        setType(parsed.type ?? 'medical_emergency');
        setSeverity(parsed.severity ?? 'critical');
        setDescription(parsed.description ?? 'I need immediate help.');
        setContact(parsed.contact ?? defaultContact);
      } catch {
        // ignore malformed saved form
      }
    }

    setOfflineQueueCount(getOfflineQueue<SOSPayload>('sos-alert').length);
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      syncPendingSOS();
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    syncPendingSOS();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'arogyaai-sos-form',
      JSON.stringify({ latitude, longitude, address, type, severity, description, contact })
    );
  }, [latitude, longitude, address, type, severity, description, contact]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const socket = io(window.location.origin, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      setStatusMessage('Connected to emergency network.');
      socket.emit('joinRoom', 'public');
    });
    socket.on('emergency:status', (payload) => {
      setStatusMessage(`Emergency update: ${payload?.status ?? 'received'}`);
    });
    socket.on('disconnect', () => setStatusMessage('Disconnected from emergency network.'));
    return () => {
      socket.disconnect();
    };
  }, []);

  async function loadLocation() {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not available in this browser.');
      return;
    }
    setStatusMessage('Locating you...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = pos.coords;
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setAddress(`Lat ${coords.latitude.toFixed(4)}, Lon ${coords.longitude.toFixed(4)}`);
        setStatusMessage('Location acquired. Fetching nearby hospitals...');
        await fetchHospitals(coords.latitude, coords.longitude);
      },
      () => setStatusMessage('Unable to access location. Please allow location access.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  async function fetchHospitals(lat: number, lng: number) {
    try {
      const response = await fetch(`/api/hospitals/nearby?latitude=${lat}&longitude=${lng}&maxDistance=15`);
      const data = await response.json();
      setHospitals(data.hospitals ?? []);
    } catch {
      setHospitals([]);
    }
  }

  async function syncPendingSOS() {
    const remaining = await processOfflineQueue<SOSPayload>('sos-alert', async (payload) => {
      const response = await fetch('/api/emergencies/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.ok;
    });

    setOfflineQueueCount(remaining);
    if (remaining === 0 && !isOffline) {
      setStatusMessage('All pending offline SOS alerts have been synced.');
    }
  }

  const { data: session } = useSession();

  async function handleSOS() {
    if (latitude === null || longitude === null) {
      setStatusMessage('Please acquire your location before sending SOS.');
      return;
    }
    setLoading(true);
    setStatusMessage('Sending SOS...');

    const body: SOSPayload = {
      userId: session?.user?.id ?? '000000000000000000000000',
      type,
      severity,
      description,
      location: { latitude, longitude, address },
      emergencyContacts: contact.name ? [contact] : [],
    };

    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        addOfflineQueueItem('sos-alert', body);
        setOfflineQueueCount(getOfflineQueue<SOSPayload>('sos-alert').length);
        setStatusMessage('Offline mode active. SOS saved locally and will sync when connection returns.');
        setResult(null);
        return;
      }

      const response = await fetch('/api/emergencies/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.error || 'Failed to send SOS.');
        setResult(null);
      } else {
        setStatusMessage('SOS sent successfully. Help is on the way.');
        setResult(`Emergency created with ID ${data.emergency?._id ?? data.emergency?.id ?? 'unknown'}`);
        socketRef.current?.emit('emergency:created', data.emergency);
      }
    } catch {
      setOfflineQueueCount(getOfflineQueue<SOSPayload>('sos-alert').length);
      setStatusMessage('Unable to reach emergency service. The SOS has been saved for later delivery.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-8 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">SOS Emergency Assistant</h1>
        <p className="mt-3 text-slate-600">Trigger an emergency alert, share real-time location, view nearby hospitals, and stay connected with responders.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <button type="button" onClick={loadLocation} className="inline-flex items-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
              Acquire GPS Location
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="emergency-type" className="block text-sm font-medium text-slate-700">Emergency type</label>
                <select id="emergency-type" value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="medical_emergency">Medical</option>
                  <option value="mental_health_crisis">Mental health</option>
                  <option value="accident">Accident</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="severity-level" className="block text-sm font-medium text-slate-700">Severity level</label>
                <select id="severity-level" value={severity} onChange={(e) => setSeverity(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <label htmlFor="emergency-description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea id="emergency-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-2xl border px-4 py-3 text-sm" />

            <div className="grid gap-4 sm:grid-cols-3">
              <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Contact name" className="rounded-2xl border px-4 py-3 text-sm" />
              <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border px-4 py-3 text-sm" />
              <input value={contact.relation} onChange={(e) => setContact({ ...contact, relation: e.target.value })} placeholder="Relation" className="rounded-2xl border px-4 py-3 text-sm" />
            </div>

            <button type="button" onClick={handleSOS} disabled={loading} className="mt-2 inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Sending SOS...' : 'Send SOS Alert'}
            </button>

            <div className="space-y-2 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <p><strong>Status:</strong> {statusMessage}</p>
              {result && <p className="text-emerald-700">{result}</p>}
              {isOffline && (
                <p className="text-amber-700">Offline mode active. {offlineQueueCount} pending SOS alert{offlineQueueCount === 1 ? '' : 's'} will sync when online.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Current location</h2>
              <p className="mt-3 text-sm text-slate-600">{address}</p>
              {latitude !== null && longitude !== null ? (
                <div className="mt-4 text-sm text-slate-700">
                  <p>Latitude: {latitude.toFixed(5)}</p>
                  <p>Longitude: {longitude.toFixed(5)}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Location not yet acquired.</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Nearby hospitals</h2>
              {hospitals.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {hospitals.map((hospital) => (
                    <li key={hospital.name} className="rounded-2xl bg-slate-50 p-4">
                      <div className="font-semibold">{hospital.name}</div>
                      <div>{hospital.address}</div>
                      <div className="text-xs text-slate-500">{hospital.distanceKm.toFixed(1)} km away</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Press “Acquire GPS Location” to load nearby hospitals.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Live incident map</h2>
        <p className="mt-2 text-sm text-slate-600">Your location is displayed on the map for responders and emergency coordinators.</p>
        <div className="mt-6">
          <EmergencyMap center={latitude !== null && longitude !== null ? [latitude, longitude] : undefined} markers={mapMarkers} radius={3000} />
        </div>
      </div>
    </section>
  );
}
