import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth/nextauth';
import EmergencyResponderDashboard from '../../../components/EmergencyResponderDashboard';
import TokenStatus from '../../../components/TokenStatus';

export default async function EmergencyDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? 'Responder';

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-arogya-700">Emergency responder access</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">{name}</h1>
            <p className="mt-2 text-sm text-[#3a5d42]">Coordinate rapid response for critical patients and ambulance dispatch.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <EmergencyResponderDashboard />
        <aside className="hidden lg:block">
          <TokenStatus />
        </aside>
      </div>
    </div>
  );
}
