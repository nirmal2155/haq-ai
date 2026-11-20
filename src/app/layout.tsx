import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/useAuth';
import {
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  TrendingDown,
  Settings,
  Plus,
  ShieldAlert,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Haq AI Studio — MSME Statutory Payment Rights & Section 43B(h)',
  description:
    'Google AI Studio style copilot empowering Indian micro & small enterprises with deterministic legal-math under MSMED Act Sections 15 & 16 and Income Tax Section 43B(h).',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0b0f17',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-[#0b0f17] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
        {/* Statutory Legal Disclaimer Banner - Mandatory Across All Screens */}
        <div className="bg-slate-950/90 border-b border-amber-500/25 text-amber-200/90 text-xs py-2 px-4 text-center font-mono flex items-center justify-center gap-2 backdrop-blur-md">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider text-[10px] border border-amber-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Statutory Draft Only
          </span>
          <span className="text-[11px] sm:text-xs">
            Haq AI is a decision-support &amp; drafting copilot, not legal advice. Review with a CA/lawyer before sending.
          </span>
        </div>

        {/* Google AI Studio Style Top Navigation Bar */}
        <header className="bg-slate-950/80 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left Brand */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Haq AI
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Studio
                  </span>
                </div>
              </Link>

              <span className="hidden xl:inline text-[11px] font-mono text-slate-500 border-l border-slate-800 pl-3">
                MSMED Act 2006 · IT Act s.43B(h)
              </span>
            </div>

            {/* Center Studio Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs font-medium">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                Overview
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/approval"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Approval Queue</span>
              </Link>
              <Link
                href="/buyer"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Buyer 43B(h) Risk</span>
              </Link>
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all min-h-[36px]"
              >
                <Plus className="w-4 h-4" />
                <span>New Invoice</span>
              </Link>

              <Link
                href="/login"
                className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800/80 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Main Application Area */}
        <AuthProvider>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {children}
          </main>
        </AuthProvider>

        {/* Studio Minimalist Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-slate-300 text-xs">
                Deterministic Engine: <span className="text-emerald-400 font-semibold">Verified 100% (Decimal.js)</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Startup Buildathon India 2026</span>
            </div>

            <div className="text-slate-500 text-[11px] text-center md:text-right">
              Empowering India&apos;s Micro &amp; Small Enterprises under MSMED Act 2006 (ss. 15-18) &amp; Income Tax Act s.43B(h).
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
