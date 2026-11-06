'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error id only — no PII per AGENTS.md rule
    if (error.digest) {
      console.error('[ERROR_BOUNDARY]', error.digest);
    }
  }, [error]);

  return (
    <div className="max-w-lg mx-auto text-center py-24 space-y-6">
      <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-500 mt-2">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
