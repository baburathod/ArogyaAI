import '../styles/globals.css';
import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { NavBar } from '../components/NavBar';
import { Providers } from '../components/Providers';
import { PWACore } from '../components/PWACore';

export const metadata = {
  title: 'ArogyaAI — First Mile Healthcare',
  description: 'Accessible Bharat healthcare assistant',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen">
            <NavBar />
            <PWACore />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
