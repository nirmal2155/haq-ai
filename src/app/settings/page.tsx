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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-2 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-base">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">{t.settings_title}</h1>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['en', 'hi', 'gu'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] ${
                  lang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Language Selection Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">{t.settings_language}</h2>
              <p className="text-sm text-slate-500">Switch application interface language</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English', sub: 'Default' },
              { code: 'hi', label: 'हिंदी', sub: 'Devanagari' },
              { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code as 'en' | 'hi' | 'gu')}
                className={`p-3 rounded-lg border text-left transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  lang === item.code
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-semibold text-base">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DPDP Act Right to Erasure Card */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-red-950">{t.settings_delete_data}</h2>
              <p className="text-sm text-slate-600 mt-1">
                Under Section 12 of the Digital Personal Data Protection (DPDP) Act 2023, you have the right to permanent erasure of all personal data, invoices, cases, evidence, and account records.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Warning:</strong> {t.settings_delete_warning}
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {deletionSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">{t.settings_delete_success}</p>
                <p className="text-xs text-emerald-600">Signing out and redirecting...</p>
              </div>
            </div>
          ) : !confirmPrompt ? (
            <button
              onClick={() => setConfirmPrompt(true)}
              className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-300 hover:bg-red-50 font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.settings_delete_button}</span>
            </button>
          ) : (
            <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-300">
              <p className="text-sm font-semibold text-red-900">
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg min-h-[44px] text-sm transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Erasing Everything...' : 'Yes, Delete Permanently'}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setConfirmPrompt(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-lg min-h-[44px] text-sm border border-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <p className="text-center text-xs text-slate-500 italic pt-4">
          {t.disclaimer}
        </p>
      </main>
    </div>
  );
}
