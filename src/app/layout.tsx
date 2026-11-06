import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/useAuth';

export const metadata: Metadata = {
  title: 'Haq AI — MSME Statutory Payment Rights & Section 43B(h)',
  description:
    'Haq AI helps Indian micro and small suppliers enforce statutory payment rights under the MSMED Act and tracks Section 43B(h) buyer risk.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {/* Statutory Legal Disclaimer Banner - Mandatory across all screens */}
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs sm:text-sm py-2 px-4 text-center font-medium">
          <span className="font-bold uppercase tracking-wide mr-1">Draft Only:</span>
          Haq AI is a drafting and decision-support tool, not legal advice. Review with a CA/lawyer before sending.
        </div>

        {/* Global Navigation Bar */}
        <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-xl px-2.5 py-1 rounded">
                  HAQ
                </span>
                <span className="font-bold text-xl tracking-tight">AI</span>
              </Link>
              <span className="hidden md:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
                MSMED Act 2006 · Sec 43B(h)
              </span>
            </div>

            <nav className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="text-slate-200 hover:text-emerald-400 transition-colors"
              >
                Supplier Dashboard
              </Link>
              <Link
                href="/buyer"
                className="text-slate-200 hover:text-amber-400 transition-colors"
              >
                Buyer Risk (43B(h))
              </Link>
              <Link
                href="/invoices/new"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md transition-colors text-xs sm:text-sm shadow"
              >
                + Upload Invoice
              </Link>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white text-xs transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <AuthProvider>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </AuthProvider>

        {/* Footer */}
        <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/tech_titan_logo.jpg"
                alt="Tech Titan Logo"
                className="w-6 h-6 rounded-full object-cover border border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Built by <span className="text-emerald-700 font-bold">Team Tech Titan</span> · Startup Buildathon India 2026
              </span>
            </div>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Empowering India&apos;s Micro &amp; Small Enterprises with deterministic legal-math under MSMED Act 2006 (Sections 15 &amp; 16) and Income Tax Section 43B(h).
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
