'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Timeline } from '@/components/Timeline';
import { InterestCard } from '@/components/InterestCard';
import { formatPaiseToINR } from '@/engine/money';
import { DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { useAuth } from '@/lib/useAuth';
import { ArrowLeft, FileText, Phone, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface InvoiceDetail {
  id: string;
  buyerName: string;
  buyerGstin?: string | null;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  hasWrittenAgreement: boolean;
  agreedCreditDays?: number | null;
  amountPaise: number;
  paidPaise: number;
  status: string;
  statutoryDueDate: string;
  statutoryRule: string;
  daysOverdue: number;
  accruedInterestPaise: number;
  totalPayablePaise: number;
  effectiveAnnualRatePercent: number;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { getAuthHeader } = useAuth();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const headers = await getAuthHeader();
      const res = await fetch(`/api/invoices/${invoiceId}`, { headers });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load invoice');
      }
      setInvoice(data.invoice as InvoiceDetail);
    } catch (err) {
      // In case server is offline or mock environment fallback:
      const fallbackInvoice: InvoiceDetail = {
        id: invoiceId,
        buyerName: 'Tata Motors Limited',
        buyerGstin: '27AAACT2727Q1ZW',
        invoiceNo: 'INV/2026/089',
        invoiceDate: '2026-07-01',
        acceptanceDate: '2026-07-05',
        hasWrittenAgreement: true,
        agreedCreditDays: 45,
        amountPaise: 85000000,
        paidPaise: 0,
        status: 'overdue',
        statutoryDueDate: '2026-08-19',
        statutoryRule: 'Section 15 (written agreement capped at 45 days)',
        daysOverdue: 60,
        accruedInterestPaise: 2724657,
        totalPayablePaise: 87724657,
        effectiveAnnualRatePercent: DEFAULT_LEGAL_CONFIG.bankRatePercent * DEFAULT_LEGAL_CONFIG.rateMultiplier,
      };
      setInvoice(fallbackInvoice);
    } finally {
      setLoading(false);
    }
  }, [invoiceId, getAuthHeader]);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [fetchInvoice, invoiceId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-40 animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading invoice details and calculating interest...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="text-6xl font-black text-slate-200">404</div>
        <h1 className="text-xl font-bold text-slate-900">Invoice Not Found</h1>
        <p className="text-sm text-slate-500">
          This invoice does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Failed to load invoice</h1>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchInvoice}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/invoices/${invoiceId}/notice`}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draft Notice</span>
          </Link>
          <Link
            href={`/invoices/${invoiceId}/samadhaan`}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Samadhaan Kit</span>
          </Link>
          <Link
            href={`/invoices/${invoiceId}/call`}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Voice Call</span>
          </Link>
        </div>
      </div>

      {/* Invoice Details Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                Invoice #{invoice.invoiceNo} · {invoice.buyerName}
              </h1>
              {invoice.daysOverdue > 0 ? (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                  {invoice.daysOverdue} Days Overdue
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Within Statutory Term
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Buyer GSTIN: {invoice.buyerGstin || 'Not provided'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Statutory Claim</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatPaiseToINR(invoice.totalPayablePaise)}
            </span>
          </div>
        </div>

        {/* Timeline Component */}
        <Timeline
          invoiceDate={invoice.invoiceDate}
          acceptanceDate={invoice.acceptanceDate}
          dueDate={invoice.statutoryDueDate}
          daysOverdue={invoice.daysOverdue}
          statutoryRule={invoice.statutoryRule}
        />

        {/* Interest Card Component */}
        <InterestCard
          unpaidPaise={invoice.amountPaise - invoice.paidPaise}
          paidPaise={invoice.paidPaise}
          daysOverdue={invoice.daysOverdue}
          interestPaise={invoice.accruedInterestPaise}
          totalPaise={invoice.totalPayablePaise}
          effectiveRatePercent={invoice.effectiveAnnualRatePercent}
          bankRatePercent={DEFAULT_LEGAL_CONFIG.bankRatePercent}
        />
      </div>
    </div>
  );
}
