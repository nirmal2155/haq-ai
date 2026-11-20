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
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl space-y-6 text-center backdrop-blur-xl">
      <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          Secure Authentication
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to Haq AI Studio</h1>
        <p className="text-xs text-slate-400">
          Enforce statutory payment rights under MSMED Act 2006 &amp; Section 43B(h)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider min-h-[44px]"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Authenticating...' : 'Sign In with Google Account'}
        </button>

        <button
          onClick={handleDemoSignIn}
          className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-xl transition min-h-[40px]"
        >
          Explore Studio Demo Mode (Instant Access)
        </button>
      </div>

      <p className="text-[11px] text-slate-500 italic">
        Draft only. Haq AI produces calculations &amp; drafts, not legal advice. Review with a CA/lawyer.
      </p>
    </div>
  );
}
