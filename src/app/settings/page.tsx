'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import en from '@/i18n/en.json';
import hi from '@/i18n/hi.json';
import gu from '@/i18n/gu.json';
import { ShieldAlert, Trash2, ArrowLeft, Globe, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, getAuthHeader, logout } = useAuth();
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = lang === 'hi' ? hi : lang === 'gu' ? gu : en;

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/user/data', {
        method: 'DELETE',
        headers: {
          ...authHeader,
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.error || 'Failed to erase data');
      }

      setDeletionSuccess(true);
      setTimeout(async () => {
        await logout();
        window.location.href = '/';
      }, 2500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setIsDeleting(false);
      setConfirmPrompt(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.settings_title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage language preferences and DPDP Act 2023 statutory privacy rights.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Language Selection Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.settings_language}</h2>
              <p className="text-xs text-slate-400">Switch application interface language (English, हिंदी, ગુજરાતી)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English', sub: 'Statutory Default' },
              { code: 'hi', label: 'हिंदी', sub: 'Devanagari Script' },
              { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati Script' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code as 'en' | 'hi' | 'gu')}
                className={`p-4 rounded-xl border text-left transition-all min-h-[52px] ${
                  lang === item.code
                    ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500/50'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-white">{item.label}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DPDP Act Right to Erasure Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-red-500/30 shadow-xl p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.settings_delete_data}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Under Section 12 of India&apos;s Digital Personal Data Protection (DPDP) Act 2023, you have the right to permanent erasure of all personal data, invoices, cases, evidence, and account records.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200/90 leading-relaxed font-mono">
            <strong>Warning:</strong> {t.settings_delete_warning}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 font-mono">
              {errorMsg}
            </div>
          )}

          {deletionSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t.settings_delete_success}</p>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">Signing out and redirecting to studio...</p>
              </div>
            </div>
          ) : !confirmPrompt ? (
            <button
              onClick={() => setConfirmPrompt(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 px-4 rounded-xl transition-all min-h-[44px] text-xs font-mono uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.settings_delete_button}</span>
            </button>
          ) : (
            <div className="space-y-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30">
              <p className="text-xs font-semibold text-red-200">
                Are you absolutely sure? This will execute complete cryptographic erasure under the DPDP Act.
              </p>
              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-xl min-h-[40px] text-xs font-mono transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Erasing Everything...' : 'Yes, Delete Permanently'}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setConfirmPrompt(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl min-h-[40px] text-xs font-mono border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <p className="text-center text-[11px] text-slate-500 italic pt-2">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
