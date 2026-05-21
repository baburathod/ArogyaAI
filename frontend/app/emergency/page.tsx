import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth/nextauth';
import EmergencySOS from '../../components/EmergencySOS';

export default async function EmergencyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">Phase 6</p>
            <h1 className="text-4xl font-semibold text-slate-900">Emergency SOS & Live Dispatch</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">Activate an SOS alert, share your GPS location in real time, and coordinate with hospitals and responders.</p>
          </div>
          <Link href="/dashboard/emergency" className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Open Responder Dashboard
          </Link>
        </div>
        <EmergencySOS />
      </div>
    </main>
  );
}
