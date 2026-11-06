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

  const t = translations[lang];

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch('/api/invoices', {
          headers: {
            Authorization: 'Bearer test-token-supplier_demo',
          },
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
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.nav_dashboard}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.app_subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* EN / HI / GU Language Toggle */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded-md transition ${
                lang === 'hi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang('gu')}
              className={`px-2.5 py-1 rounded-md transition ${
                lang === 'gu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          <Link
            href="/invoices/new"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.nav_new_invoice}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.total_overdue}
            </span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPaiseToINR(totalOverduePrincipal)}
          </div>
          <span className="text-[11px] text-slate-400">Principal dues past statutory limit</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.total_interest}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatPaiseToINR(totalAccruedInterest)}
          </div>
          <span className="text-[11px] text-slate-400">Compounded monthly at 3× RBI rate</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Statutory Claim
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950">
            {formatPaiseToINR(totalClaim)}
          </div>
          <span className="text-[11px] text-slate-400">Enforceable under MSMED Section 15-18</span>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">
            Overdue Invoices (Sorted by Accrued Interest)
          </h2>
          <span className="text-xs text-slate-500">
            {invoices.length} Registered Invoices
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-medium">Computing statutory interest and dues...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-600 font-medium">No invoices registered yet.</p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" />
              Upload First Invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inv.buyerName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      #{inv.invoiceNo}
                    </span>
                    {inv.daysOverdue > 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                        {inv.daysOverdue} {t.days_overdue}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Within Term
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Due Date: <strong>{inv.statutoryDueDate}</strong></span>
                    <span>Principal: <strong>{formatPaiseToINR(inv.amountPaise)}</strong></span>
                    {inv.daysOverdue > 0 && (
                      <span className="text-emerald-700 font-bold">
                        Accrued 3x Interest: {formatPaiseToINR(inv.accruedInterestPaise)}
                      </span>
                    )}
                  </div>
                </div>

                {/* One-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/invoices/${inv.id}/notice`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-1.5"
                    title={t.action_generate_notice}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.action_generate_notice}</span>
                  </Link>

                  <Link
                    href={`/invoices/${inv.id}/samadhaan`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-1.5"
                    title={t.action_samadhaan_kit}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.action_samadhaan_kit}</span>
                  </Link>

                  <Link
                    href={`/invoices/${inv.id}/call`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-1.5"
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
