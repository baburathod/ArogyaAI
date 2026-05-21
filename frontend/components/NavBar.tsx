"use client";
import { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from './MobileNav';
import { signOut, useSession } from 'next-auth/react';

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="bg-white/70 backdrop-blur sticky top-0 z-40 border-b border-[rgba(15,38,23,0.04)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-arogya-100 p-2">
            <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="20" fill="rgba(255,255,255,0.12)" stroke="rgba(15,38,23,0.3)" strokeWidth="1.5"/>
              <rect x="19" y="10" width="6" height="24" rx="3" fill="#0f8c51"/>
              <rect x="10" y="19" width="24" height="6" rx="3" fill="#0f8c51"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">ArogyaAI</div>
            <div className="text-xs text-[#386d4f]">First-Mile Healthcare</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/body-map" className="nav-link">Body Map</Link>
          <Link href="/emergency" className="nav-link">SOS</Link>
          <Link href="/ai" className="nav-link">AI Assistant</Link>
          <Link href="/voice" className="nav-link">Voice Assistant</Link>
          <Link href="#" className="nav-link">Records</Link>
          <Link href="#" className="nav-link">Hospitals</Link>
          <Link href="#" className="nav-link">Doctor</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline-block text-sm text-[#1e472e]">{session.user?.role?.toUpperCase()}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="rounded-[18px] border border-[rgba(15,38,23,0.12)] bg-white px-3 py-2 text-sm font-semibold text-arogya-700 hover:bg-arogya-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="rounded-[18px] border border-[rgba(15,38,23,0.12)] bg-white px-3 py-2 text-sm font-semibold text-arogya-700 hover:bg-arogya-50">
              Sign in
            </Link>
          )}
          <button aria-label="Open mobile menu" className="md:hidden p-2" onClick={() => setOpen(true)}>
            ☰
          </button>
          <div className="hidden md:block">
            <label className="sr-only">Language</label>
            <select aria-label="Language selector" defaultValue="en" className="rounded-md border px-2 py-1">
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="te">తె</option>
            </select>
          </div>
        </div>

        <MobileNav open={open} onClose={() => setOpen(false)} />
      </div>
    </header>
  );
}
