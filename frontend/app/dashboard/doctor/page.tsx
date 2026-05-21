import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth/nextauth';

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? 'Doctor';

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-arogya-700">Hello Dr.</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">{name}</h1>
            <p className="mt-2 text-sm text-[#3a5d42]">Your doctor dashboard helps you manage patient cases and consultation workflows.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold">Patient Queue</h2>
          <p className="mt-2 text-sm text-[#425b43]">Review incoming cases and prioritized rural referrals.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Clinical Notes</h2>
          <p className="mt-2 text-sm text-[#425b43]">Keep treatment history and prescriptions organized securely.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Teleconsult</h2>
          <p className="mt-2 text-sm text-[#425b43]">Coordinate with remote health workers and emergency teams.</p>
        </div>
      </section>
    </div>
  );
}
