import type { Metadata } from 'next';
import './globals.css';
import { DemoBar } from '@/components/DemoBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'FreshLoop — Surplus Matching & Verified Impact',
  description:
    'FreshLoop matches surplus food supply to community kitchen demand with explainable ranking, transactional reservation, and verified two-party collection tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Suspense fallback={<div className="h-8 bg-emerald-950" />}>
          <DemoBar />
        </Suspense>
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
