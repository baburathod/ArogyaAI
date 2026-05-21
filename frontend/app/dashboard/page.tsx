import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth/nextauth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = session.user.role;
  switch (role) {
    case 'admin':
      redirect('/dashboard/admin');
    case 'doctor':
      redirect('/dashboard/doctor');
    case 'emergency':
      redirect('/dashboard/emergency');
    default:
      redirect('/dashboard/patient');
  }
}
