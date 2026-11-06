'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebaseClient';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to Haq AI</h1>
        <p className="text-xs text-slate-500">
          Enforce statutory payment rights under MSMED Act 2006
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing In...' : 'Sign In with Google'}
        </button>

        <button
          onClick={handleDemoSignIn}
          className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold rounded-lg transition text-xs"
        >
          Explore Demo Mode (Pre-loaded Invoices)
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        By signing in, you agree that Haq AI is a drafting & decision-support tool, not legal advice.
      </p>
    </div>
  );
}
