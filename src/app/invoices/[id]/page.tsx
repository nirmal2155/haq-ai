'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Timeline } from '@/components/Timeline';
import { InterestCard } from '@/components/InterestCard';
import { formatPaiseToINR } from '@/engine/money';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { ArrowLeft, FileText, Phone, ExternalLink } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  // Invoice state with fallback sample
  const [invoice, setInvoice] = useState<any>({
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
  });

  const today = new Date().toISOString().split('T')[0];

  const deadline = computeDueDate({
    acceptanceDate: invoice.acceptanceDate,
    hasWrittenAgreement: invoice.hasWrittenAgreement,
    agreedCreditDays: invoice.agreedCreditDays,
  });

  const interest = computeInterest({
    principalPaise: invoice.amountPaise,
    dueDate: deadline.dueDate,
    asOfDate: today,
    paidPaise: invoice.paidPaise,
    config: DEFAULT_LEGAL_CONFIG,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Invoice #{invoice.invoiceNo} · {invoice.buyerName}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              GSTIN: {invoice.buyerGstin || 'Not provided'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Statutory Claim</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatPaiseToINR(interest.totalPaise)}
            </span>
          </div>
        </div>

        {/* Timeline Component */}
        <Timeline
          invoiceDate={invoice.invoiceDate}
          acceptanceDate={invoice.acceptanceDate}
          dueDate={deadline.dueDate}
          daysOverdue={interest.daysOverdue}
          statutoryRule={deadline.rule}
        />

        {/* Interest Card Component */}
        <InterestCard
          unpaidPaise={interest.unpaidPrincipalPaise}
          paidPaise={invoice.paidPaise}
          daysOverdue={interest.daysOverdue}
          interestPaise={interest.interestPaise}
          totalPaise={interest.totalPaise}
          effectiveRatePercent={interest.effectiveAnnualRatePercent}
          bankRatePercent={DEFAULT_LEGAL_CONFIG.bankRatePercent}
        />
      </div>
    </div>
  );
}
