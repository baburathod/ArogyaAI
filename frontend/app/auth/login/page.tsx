"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard'
    });

    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }

    router.push(result?.url ?? '/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#eef9f1] via-[#eff6ff] to-[#e9f4e8]">
      <Card className="max-w-md w-full">
        <div className="mb-6">
          <p className="text-sm text-arogya-700">Access ArogyaAI securely</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0c2e1e]">Sign in</h1>
          <p className="mt-2 text-sm text-[#47644d]">Log in with your email and continue to your role-based dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#34543a]">
          New to ArogyaAI?{' '}
          <Link href="/auth/signup" className="font-semibold text-arogya-700 hover:text-arogya-900">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
