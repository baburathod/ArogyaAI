import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    accessToken?: string;
  }
}
