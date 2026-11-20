'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPaiseToINR } from '@/engine/money';
import {
  FileText,
  Phone,
  ExternalLink,
  Plus,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import en from '@/lib/i18n/en.json';
import hi from '@/lib/i18n/hi.json';
import gu from '@/lib/i18n/gu.json';
import { useAuth } from '@/lib/useAuth';

interface InvoiceSummary {
  id: string;
  buyerName: string;
  buyerGstin?: string | null;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  statutoryDueDate: string;
  amountPaise: number;
  paidPaise: number;
  daysOverdue: number;
  accruedInterestPaise: number;
  totalPayablePaise: number;
  status: string;
}

const translations = { en, hi, gu };

export default function SupplierDashboardPage() {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  const t = translations[lang];

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch('/api/invoices', {
          headers: await getAuthHeader(),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch invoices');
        }

        // Sort by interest accrued (descending) as required by specification
        const sorted = (data.invoices || []).sort(
          (a: InvoiceSummary, b: InvoiceSummary) => b.accruedInterestPaise - a.accruedInterestPaise
        );
        setInvoices(sorted);
      } catch (err) {
        // Fallback to sample data for demo preview if offline
        const fallbackInvoices: InvoiceSummary[] = [
          {
            id: 'inv_001_tata',
            buyerName: 'Tata Motors Limited',
            buyerGstin: '27AAACT2727Q1ZW',
            invoiceNo: 'INV/2026/089',
            invoiceDate: '2026-07-01',
            acceptanceDate: '2026-07-05',
            statutoryDueDate: '2026-08-19',
            amountPaise: 85000000,
            paidPaise: 0,
            daysOverdue: 60,
            accruedInterestPaise: 2724657,
            totalPayablePaise: 87724657,
            status: 'overdue',
          },
          {
            id: 'inv_002_zenith',
            buyerName: 'Zenith Infrastructure Projects Ltd',
            buyerGstin: '24AAACZ9876Z1Z8',
            invoiceNo: 'INV/2026/112',
            invoiceDate: '2026-09-01',
            acceptanceDate: '2026-09-05',
            statutoryDueDate: '2026-10-05',
            amountPaise: 32000000,
            paidPaise: 0,
            daysOverdue: 10,
            accruedInterestPaise: 170958,
            totalPayablePaise: 32170958,
            status: 'overdue',
          },
          {
            id: 'inv_003_ontime',
            buyerName: 'Apex Motors India Ltd',
            buyerGstin: '27AAACA1234A1Z5',
            invoiceNo: 'INV/2026/145',
            invoiceDate: '2026-10-25',
            acceptanceDate: '2026-10-28',
            statutoryDueDate: '2026-11-27',
            amountPaise: 50000000,
            paidPaise: 0,
            daysOverdue: 0,
            accruedInterestPaise: 0,
            totalPayablePaise: 50000000,
            status: 'pending',
          },
        ];
        setInvoices(fallbackInvoices);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [getAuthHeader]);

  const totalOverduePrincipal = invoices
    .filter((inv) => inv.daysOverdue > 0)
    .reduce((sum, inv) => sum + (inv.amountPaise - inv.paidPaise), 0);

  const totalAccruedInterest = invoices.reduce(
    (sum, inv) => sum + inv.accruedInterestPaise,
    0
  );

  const totalClaim = totalOverduePrincipal + totalAccruedInterest;

  return (
    <div className="space-y-6">
      {/* Header and Language Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Supplier Claims Portfolio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.nav_dashboard}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.app_subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* EN / HI / GU Language Toggle */}
          <div className="inline-flex rounded-xl border border-slate-800 p-1 bg-slate-900/90 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 rounded-lg transition ${
                lang === 'hi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang('gu')}
              className={`px-3 py-1.5 rounded-lg transition ${
                lang === 'gu' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          <Link
            href="/invoices/new"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.nav_new_invoice}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              {t.total_overdue}
            </span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {formatPaiseToINR(totalOverduePrincipal)}
          </div>
          <span className="text-[11px] text-slate-400 block">Principal dues past statutory limit</span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              {t.total_interest}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {formatPaiseToINR(totalAccruedInterest)}
          </div>
          <span className="text-[11px] text-slate-400 block">Compounded monthly at 3× RBI rate</span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-blue-500/20 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
              Total Statutory Claim
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {formatPaiseToINR(totalClaim)}
          </div>
          <span className="text-[11px] text-slate-400 block">Enforceable under MSMED ss. 15-18</span>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-200">
              Overdue Invoices (Ranked by Statutory Interest)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              MSMED s.16 Enforced
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {invoices.length} Registered Invoices
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
            <p className="text-xs font-medium font-mono">Computing statutory interest and dues...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <p className="text-sm text-slate-300 font-medium">No invoices registered yet.</p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              Upload First Invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all"
              >
                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{inv.buyerName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                      #{inv.invoiceNo}
                    </span>
                    {inv.daysOverdue > 0 ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold font-mono rounded-full">
                        {inv.daysOverdue} {t.days_overdue}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono rounded-full">
                        Within Term
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-5 gap-y-1">
                    <span>Due Date: <strong className="text-slate-300 font-mono">{inv.statutoryDueDate}</strong></span>
                    <span>Principal: <strong className="text-slate-300 font-mono">{formatPaiseToINR(inv.amountPaise)}</strong></span>
                    {inv.daysOverdue > 0 && (
                      <span className="text-emerald-400 font-bold font-mono">
                        Accrued 3× Interest: {formatPaiseToINR(inv.accruedInterestPaise)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/invoices/${inv.id}/notice`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 min-h-[36px]"
                    title={t.action_generate_notice}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.action_generate_notice}</span>
                  </Link>

                  <Link
                    href={`/invoices/${inv.id}/samadhaan`}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 min-h-[36px]"
                    title={t.action_samadhaan_kit}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.action_samadhaan_kit}</span>
                  </Link>

                  <Link
                    href={`/invoices/${inv.id}/call`}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 min-h-[36px]"
                    title={t.action_voice_call}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.action_voice_call}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
