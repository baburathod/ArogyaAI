import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth/nextauth';
import PopulationHealthInsights from '../../../components/PopulationHealthInsights';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? 'Admin';

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-arogya-700">Platform admin console</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">{name}</h1>
            <p className="mt-2 text-sm text-[#3a5d42]">Manage users, access controls, and platform operations for ArogyaAI.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold">User Management</h2>
          <p className="mt-2 text-sm text-[#425b43]">Review registered accounts and role assignments.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Security</h2>
          <p className="mt-2 text-sm text-[#425b43]">Monitor session activity and enforce platform policies.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Platform Insights</h2>
          <p className="mt-2 text-sm text-[#425b43]">View service health, emergency response metrics, and usage trends.</p>
        </div>
      </section>

      <PopulationHealthInsights />
    </div>
  );
}
