import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth/nextauth';
import VoiceAssistant from '../../components/VoiceAssistant';

export default async function VoicePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <VoiceAssistant />
    </section>
  );
}
