"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

const EmergencyMap = dynamic(() => import('./EmergencyMap'), { ssr: false });

type EmergencyItem = {
  _id: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: { latitude: number; longitude: number; address: string };
  createdAt: string;
};

type Analytics = {
  activeCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  respondedCount: number;
  resolvedCount: number;
};

export default function EmergencyResponderDashboard() {
  const [emergencies, setEmergencies] = useState<EmergencyItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [responders, setResponders] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [selectedResponderMap, setSelectedResponderMap] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();

  const mapMarkers = useMemo(
    () => emergencies.map((emergency) => ({
      id: emergency._id,
      lat: emergency.location.latitude,
      lng: emergency.location.longitude,
      title: `${emergency.type.replace(/_/g, ' ')}`,
      description: `${emergency.severity} - ${emergency.status}`,
      type: emergency.type,
    })),
    [emergencies]
  );

  useEffect(() => {
    async function loadDashboard() {
      const bearerHeader: HeadersInit | undefined = session?.user?.accessToken
        ? { Authorization: `Bearer ${session.user.accessToken}` }
        : undefined;

      const [urgentRes, analyticsRes, respondersRes] = await Promise.all([
        fetch('/api/emergencies/active', { headers: bearerHeader }),
        fetch('/api/emergencies/analytics', { headers: bearerHeader }),
        fetch('/api/responders/available', { headers: bearerHeader }),
      ]);
      const urgentData = await urgentRes.json();
      const analyticsData = await analyticsRes.json();
      const respondersData = await respondersRes.json();
      setEmergencies(urgentData.emergencies ?? []);
      setAnalytics(analyticsData.analytics ?? null);
      setResponders(respondersData.responders ?? []);
    }

    loadDashboard();
  }, [session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const socket = io(window.location.origin, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setNotifications((prev) => [...prev, 'Connected to emergency feed.']);
      socket.emit('joinRoom', 'responder');
      // If this client is an authenticated responder, register for their private room
      if (session?.user?.id) {
        socket.emit('registerResponder', session.user.id);
      }
    });

    socket.on('emergency:created', (payload) => {
      setEmergencies((prev) => [payload.emergency, ...prev]);
      setNotifications((prev) => [`New emergency: ${payload.emergency.type}`, ...prev].slice(0, 5));
    });

    socket.on('emergency:updated', (payload) => {
      setEmergencies((prev) => prev.map((item) => (item._id === payload.emergency._id ? payload.emergency : item)));
      setNotifications((prev) => [`Updated: ${payload.emergency.status} for ${payload.emergency.type}`, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function handleStatusChange(id: string, nextStatus: string) {
    try {
      const response = await fetch(`/api/emergencies/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus, responderId: session?.user?.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmergencies((prev) => prev.map((item) => (item._id === id ? data.emergency : item)));
        setNotifications((prev) => [`${nextStatus} ${data.emergency.type} incident.`, ...prev].slice(0, 5));
      }
    } catch (error) {
      setNotifications((prev) => ['Unable to update emergency status.', ...prev].slice(0, 5));
    }
  }

  async function handleAssign(id: string, responderId: string) {
    try {
      const response = await fetch(`/api/emergencies/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
        },
        body: JSON.stringify({ responderId }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmergencies((prev) => prev.map((item) => (item._id === id ? data.emergency : item)));
        setNotifications((prev) => [`Responder assigned to ${data.emergency.type}.`, ...prev].slice(0, 5));
      }
    } catch (error) {
      setNotifications((prev) => ['Unable to assign responder.', ...prev].slice(0, 5));
    }
  }

  return (
    <section className="space-y-8 py-10">
      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Real-Time Emergency Control</h1>
              <p className="mt-2 text-sm text-slate-600">Monitor live SOS incidents, assign responders, and coordinate hospital dispatch with real-time feeds.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Active incidents</p>
              <p className="mt-1 text-3xl text-slate-900">{emergencies.length}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {emergencies.length === 0 && <p className="text-sm text-slate-500">No active emergencies at the moment.</p>}
            {emergencies.map((emergency) => (
              <article key={emergency._id} className={`rounded-3xl border p-5 ${selectedId === emergency._id ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-rose-600">{emergency.severity}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{emergency.type.replace(/_/g, ' ')}</h2>
                    <p className="mt-2 text-sm text-slate-600">{emergency.description}</p>
                    <p className="mt-3 text-sm text-slate-500">{new Date(emergency.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-sm text-slate-500">Location: {emergency.location.address}</p>
                    {responders.length > 0 && (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          aria-label="Select responder"
                          value={selectedResponderMap[emergency._id] ?? ''}
                          onChange={(e) => setSelectedResponderMap((prev) => ({ ...prev, [emergency._id]: e.target.value }))}
                          className="min-w-[220px] rounded-2xl border px-4 py-3 text-sm"
                        >
                          <option value="">Select responder</option>
                          {responders.map((responder) => (
                            <option key={responder._id} value={responder._id}>
                              {responder.name || responder.email}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const responderId = selectedResponderMap[emergency._id] ?? '';
                            if (!responderId) {
                              setNotifications((prev) => ['Please select a responder first.', ...prev].slice(0, 5));
                              return;
                            }
                            handleAssign(emergency._id, responderId);
                          }}
                          className="rounded-full bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
                        >
                          Assign Responder
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-right">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">{emergency.status}</span>
                    <button type="button" onClick={() => setSelectedId(emergency._id)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300">View on map</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleStatusChange(emergency._id, 'responded')} className="rounded-full bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700">Mark Responded</button>
                  <button type="button" onClick={() => handleStatusChange(emergency._id, 'resolved')} className="rounded-full bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-900">Resolve</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Emergency analytics</h2>
            {analytics ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                  <p className="text-slate-500">Active</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{analytics.activeCount}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                    <p className="text-slate-500">Critical</p>
                    <p className="mt-1 text-xl font-semibold text-rose-600">{analytics.criticalCount}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                    <p className="text-slate-500">Responded</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-600">{analytics.respondedCount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Loading analytics...</p>
            )}
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Live notifications</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {notifications.map((note, index) => (
                <li key={index} className="rounded-2xl bg-white p-3 shadow-sm">{note}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Emergency response map</h2>
        <p className="mt-2 text-sm text-slate-600">Track active incidents across the city with hospital and responder awareness.</p>
        <div className="mt-6">
          <EmergencyMap center={selectedId ? [
            emergencies.find((item) => item._id === selectedId)?.location.latitude ?? 20.5937,
            emergencies.find((item) => item._id === selectedId)?.location.longitude ?? 78.9629,
          ] : undefined} markers={mapMarkers} radius={3000} />
        </div>
      </div>
    </section>
  );
}
