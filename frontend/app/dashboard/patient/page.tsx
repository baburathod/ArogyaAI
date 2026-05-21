import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth/nextauth';
import NotificationsPanel from '../../../components/NotificationsPanel';
import HealthScoreCard from '../../../components/dashboard/HealthScoreCard';
import EmergencyAlerts from '../../../components/dashboard/EmergencyAlerts';
import SymptomTrendsChart from '../../../components/dashboard/SymptomTrendsChart';
import MedicationTracker from '../../../components/dashboard/MedicationTracker';
import AIHealthTips from '../../../components/dashboard/AIHealthTips';
import NearbyHospitalsWidget from '../../../components/dashboard/NearbyHospitalsWidget';
import AppointmentsWidget from '../../../components/dashboard/AppointmentsWidget';

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? 'Patient';

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-arogya-700">Welcome back</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">{name}</h1>
            <p className="mt-2 text-sm text-[#3a5d42]">Premium dashboard — personalized analytics and care widgets.</p>
          </div>
          <div className="inline-flex gap-3">
            <Link href="/auth/login" className="button button-secondary">Manage account</Link>
            <Link href="/body-map" className="button button-primary">Body Map</Link>
          </div>
        </div>
      </section>

      <NotificationsPanel />

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <HealthScoreCard score={82} />
        </div>
        <div className="lg:col-span-2">
          <EmergencyAlerts />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SymptomTrendsChart />
        </div>
        <div className="space-y-4">
          <MedicationTracker />
          <AIHealthTips />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div>
          <NearbyHospitalsWidget />
        </div>
        <div>
          <AppointmentsWidget />
        </div>
        <div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 p-4">
            <h3 className="text-sm font-semibold">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <Link href="/emergency" className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white">Trigger SOS</Link>
              <Link href="/body-map" className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">Open Body Map</Link>
              <Link href="/ai" className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Open AI Assistant</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
