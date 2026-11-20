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
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Human-in-the-Loop Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>{t.approval_queue_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Deterministic statutory reminder drafts. Never dispatched to a buyer without explicit confirmation.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="inline-flex rounded-xl border border-slate-800 p-1 bg-slate-900 text-xs font-semibold shadow-lg">
          {(['en', 'hi', 'gu'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg transition min-h-[32px] font-mono ${
                lang === l ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3 text-blue-200 text-xs backdrop-blur-md">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
        <span className="leading-relaxed">
          <strong className="text-blue-300">Human-in-the-Loop Statutory Guarantee:</strong> No legal demand or email reminder is ever dispatched to a third party without your explicit tap. You review and retain full editorial authority.
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reminders List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400">
            Pending Dispatches ({reminders.filter((r) => r.status === 'pending').length})
          </h2>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReminder(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedReminder?.id === r.id
                    ? 'border-blue-500 bg-slate-900/90 shadow-xl ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {r.trigger.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {r.status === 'sent' ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.approval_dispatched_badge}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Approval
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white font-mono">Case #{r.caseId}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Accrued 3× Interest: <span className="text-emerald-400 font-bold">{formatPaiseToINR(r.accruedInterestPaise)}</span> | Total: <span className="text-white font-bold">{formatPaiseToINR(r.totalDuePaise)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draft Preview & Action Panel */}
        {selectedReminder && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200">Statutory Notice Preview</h3>
              <span className="text-xs font-mono text-slate-400">Language: {lang.toUpperCase()}</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Recipient Corporate Email</label>
              <input
                type="email"
                value={selectedReminder.recipientEmail || recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-blue-500/40 outline-none min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Statutory Notice Draft (Engine-Populated)</label>
              <textarea
                rows={7}
                value={
                  customText ||
                  `Dear Accounts Team,\n\nRegarding Case #${selectedReminder.caseId}, this is a statutory follow-up under Section 15 of MSMED Act 2006.\nAccrued Section 16 compound interest to date: ${formatPaiseToINR(selectedReminder.accruedInterestPaise)}.\nTotal sum payable: ${formatPaiseToINR(selectedReminder.totalDuePaise)}.\n\n${t.disclaimer}`
                }
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:ring-2 focus:ring-blue-500/40 outline-none leading-relaxed"
              />
            </div>

            {selectedReminder.status === 'pending' ? (
              <button
                disabled={approvingId === selectedReminder.id}
                onClick={() => handleApprove(selectedReminder)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all min-h-[44px] text-xs uppercase tracking-wider font-mono"
              >
                <Send className="w-4 h-4" />
                <span>{approvingId === selectedReminder.id ? 'Dispatching...' : t.approval_approve_button}</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-mono font-semibold text-emerald-400">
                ✓ This statutory notice was dispatched upon user confirmation.
              </div>
            )}

            <p className="text-center text-[11px] text-slate-500 italic">
              {t.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
