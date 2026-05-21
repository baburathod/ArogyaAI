import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth/nextauth';
import BodyMapInteractive from '../../components/BodyMapInteractive';

export default async function BodyMapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <BodyMapInteractive />
    </section>
  );
}
