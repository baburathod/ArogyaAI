"use client";

import React from 'react';
import { useSession } from 'next-auth/react';

export default function TokenStatus() {
  const { data: session } = useSession();

  const copy = async () => {
    if (session?.user?.accessToken) {
      await navigator.clipboard.writeText(session.user.accessToken);
      alert('Token copied to clipboard');
    } else {
      alert('No token available');
    }
  };

  return (
    <div className="rounded-2xl border p-4 bg-slate-50 text-sm">
      <p className="font-semibold">Token (debug)</p>
      <p className="break-all mt-2 text-xs text-slate-700">{session?.user?.accessToken ?? 'No token'}</p>
      <div className="mt-3">
        <button onClick={copy} className="rounded-full bg-slate-900 px-3 py-1 text-white text-sm">Copy token</button>
      </div>
    </div>
  );
}
