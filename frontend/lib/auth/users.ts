import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { AuthRole } from './roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AuthRole;
}

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

async function readUsers(): Promise<AuthUser[]> {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf8');
    return JSON.parse(raw) as AuthUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: AuthUser[]) {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByEmail(email: string): Promise<AuthUser | undefined> {
  const normalized = email.trim().toLowerCase();
  await ensureSeededUsers();
  const users = await readUsers();
  return users.find((user) => user.email === normalized);
}

export async function verifyUser(email: string, password: string): Promise<AuthUser | null> {
  await ensureSeededUsers();
  const user = await findUserByEmail(email);
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  return isMatch ? user : null;
}

export async function createUser({ name, email, password, role }: { name: string; email: string; password: string; role?: AuthRole; }): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: AuthUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role ?? 'patient'
  };

  const users = await readUsers();
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

export async function ensureSeededUsers() {
  const users = await readUsers();
  if (users.length > 0) return users;

  const defaultUsers: AuthUser[] = [
    {
      id: randomUUID(),
      name: 'Platform Admin',
      email: 'admin@arogya.ai',
      passwordHash: await bcrypt.hash('AdminPass123!', 10),
      role: 'admin'
    },
    {
      id: randomUUID(),
      name: 'Doctor User',
      email: 'doctor@arogya.ai',
      passwordHash: await bcrypt.hash('DoctorPass123!', 10),
      role: 'doctor'
    },
    {
      id: randomUUID(),
      name: 'Responder',
      email: 'responder@arogya.ai',
      passwordHash: await bcrypt.hash('ResponderPass123!', 10),
      role: 'emergency'
    },
    {
      id: randomUUID(),
      name: 'Patient User',
      email: 'patient@arogya.ai',
      passwordHash: await bcrypt.hash('PatientPass123!', 10),
      role: 'patient'
    }
  ];

  await writeUsers(defaultUsers);
  return defaultUsers;
}
