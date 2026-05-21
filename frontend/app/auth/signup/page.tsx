"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    setLoading(false);
    const result = await response.json();
    if (!response.ok || result.error) {
      setError(result.error || 'Unable to create account.');
      return;
    }

    await signIn('credentials', { redirect: false, email, password, callbackUrl: '/dashboard' });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#eef9f1] via-[#eff6ff] to-[#e9f4e8]">
      <Card className="max-w-md w-full">
        <div className="mb-6">
          <p className="text-sm text-arogya-700">Create your ArogyaAI account</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0c2e1e]">Sign up</h1>
          <p className="mt-2 text-sm text-[#47644d]">Register as a patient and access secure healthcare dashboards.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#34543a]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-arogya-700 hover:text-arogya-900">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
