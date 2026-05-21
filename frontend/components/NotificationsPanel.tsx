"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
  actionUrl?: string;
}

export default function NotificationsPanel() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notifications/${session.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to load notifications');
        }

        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError((err as Error).message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session?.user?.id, status]);

  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-slate-500">Latest AI alerts and system messages for your care.</p>
        </div>
        <span className="rounded-full bg-[#e3f5e8] px-3 py-1 text-sm text-[#0c2e1e]">
          {notifications.length} new
        </span>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading notifications...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && notifications.length === 0 && (
        <p className="text-sm text-slate-500">No recent notifications yet.</p>
      )}

      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.12em] text-[#317d46]">{item.severity}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{item.message}</p>
            {item.actionUrl && (
              <a
                href={item.actionUrl}
                className="mt-3 inline-flex rounded-full bg-[#0c2e1e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0a2619]"
              >
                Open
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
