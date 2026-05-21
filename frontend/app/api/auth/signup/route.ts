import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '../../../../lib/auth/users';
import { ROLE_LABELS } from '../../../../lib/auth/roles';

export async function POST(request: Request) {
  const payload = await request.json();
  const { name, email, password } = payload as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
  }

  try {
    const user = await createUser({ name, email, password, role: 'patient' });
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, roleLabel: ROLE_LABELS[user.role] } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
