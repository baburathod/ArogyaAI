import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function checkRole(pathname: string, role?: string | null): boolean {
  if (!role) return false;

  if (pathname.startsWith('/dashboard/admin')) {
    return role === 'admin';
  }

  if (pathname.startsWith('/dashboard/doctor')) {
    return role === 'doctor' || role === 'admin';
  }

  if (pathname.startsWith('/dashboard/emergency')) {
    return role === 'emergency';
  }

  if (pathname.startsWith('/dashboard/patient')) {
    return role === 'patient';
  }

  return true;
}

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
        return true;
      }
      if (!token) {
        return false;
      }
      if (pathname.startsWith('/dashboard')) {
        return checkRole(pathname, token.role as string | undefined);
      }
      return true;
    }
  },
  pages: {
    signIn: '/auth/login'
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/emergency/:path*', '/voice/:path*']
};
