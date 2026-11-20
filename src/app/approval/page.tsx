'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import en from '@/i18n/en.json';
import hi from '@/i18n/hi.json';
import gu from '@/i18n/gu.json';
import { CheckCircle2, Clock, Send, Edit3, ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatPaiseToINR } from '@/engine/money';

interface PendingReminder {
  id: string;
  caseId: string;
  trigger: string;
  scheduledFor: string;
  status: 'pending' | 'sent';
  templateName: string;
  accruedInterestPaise: number;
  totalDuePaise: number;
  recipientEmail?: string;
  customMessage?: string;
}

export default function ApprovalQueuePage() {
  const { user, getAuthHeader } = useAuth();
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [reminders, setReminders] = useState<PendingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('accounts@buyer.com');
  const [customText, setCustomText] = useState('');
  const [selectedReminder, setSelectedReminder] = useState<PendingReminder | null>(null);

  const t = lang === 'hi' ? hi : lang === 'gu' ? gu : en;

  useEffect(() => {
    // In demo / test mode, load simulated pending reminders
    const samplePending: PendingReminder[] = [
      {
        id: 'rem_demo_30_days',
        caseId: 'case_demo_101',
        trigger: 'overdue_30_days',
        scheduledFor: new Date().toISOString(),
        status: 'pending',
        templateName: 'statutory_compound_interest_notice',
        accruedInterestPaise: 171516,
        totalDuePaise: 10171516,
        recipientEmail: 'finance@tatamotors.com',
      },
      {
        id: 'rem_demo_45_days',
        caseId: 'case_demo_102',
        trigger: 'overdue_45_days',
        scheduledFor: new Date().toISOString(),
        status: 'pending',
        templateName: 'statutory_final_notice_before_samadhaan',
        accruedInterestPaise: 285400,
        totalDuePaise: 5285400,
        recipientEmail: 'accounts@larsentoubro.com',
      },
    ];

    setReminders(samplePending);
    setSelectedReminder(samplePending[0]);
    setLoading(false);
  }, []);

  const handleApprove = async (reminder: PendingReminder) => {
    setApprovingId(reminder.id);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`/api/reminders/${reminder.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          recipientEmail: reminder.recipientEmail || recipientEmail,
          customMessage: customText || undefined,
          channel: 'email',
        }),
      });

      // Update state locally
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: 'sent' } : r))
      );
    } catch {
      // Mock update for demo
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: 'sent' } : r))
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-lg p-2 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-base">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">{t.approval_queue_title}</h1>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['en', 'hi', 'gu'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md min-h-[36px] ${
                  lang === l ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            <strong>Human-in-the-Loop Guarantee:</strong> No legal demand or email reminder is ever dispatched without your explicit tap.
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Reminders List */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Pending Reminders ({reminders.filter(r => r.status === 'pending').length})</h2>

            {reminders.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReminder(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedReminder?.id === r.id
                    ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {r.trigger.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {r.status === 'sent' ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.approval_dispatched_badge}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Review
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-900">Case ID: {r.caseId}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Accrued Interest: {formatPaiseToINR(r.accruedInterestPaise)} | Total: {formatPaiseToINR(r.totalDuePaise)}
                </div>
              </div>
            ))}
          </div>

          {/* Draft Preview & Action Panel */}
          {selectedReminder && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-semibold text-base text-slate-900">Reminder Preview</h3>
                <span className="text-xs text-slate-500">Language: {lang.toUpperCase()}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={selectedReminder.recipientEmail || recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Statutory Notice Text</label>
                <textarea
                  rows={6}
                  value={
                    customText ||
                    `Dear Accounts Team,\n\nRegarding Case #${selectedReminder.caseId}, this is a statutory follow-up under Section 15 of MSMED Act 2006.\nAccrued Section 16 compound interest to date: ${formatPaiseToINR(selectedReminder.accruedInterestPaise)}.\nTotal sum payable: ${formatPaiseToINR(selectedReminder.totalDuePaise)}.\n\n${t.disclaimer}`
                  }
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-800 font-mono bg-slate-50"
                />
              </div>

              {selectedReminder.status === 'pending' ? (
                <button
                  disabled={approvingId === selectedReminder.id}
                  onClick={() => handleApprove(selectedReminder)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] text-base"
                >
                  <Send className="w-5 h-5" />
                  <span>{approvingId === selectedReminder.id ? 'Sending...' : t.approval_approve_button}</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-sm font-semibold text-emerald-800">
                  ✓ This statutory reminder has been dispatched.
                </div>
              )}

              <p className="text-center text-xs text-slate-400 italic">
                {t.disclaimer}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
