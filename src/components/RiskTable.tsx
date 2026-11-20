'use client';

import React from 'react';
import { formatPaiseToINR } from '@/engine/money';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export interface BuyerInvoiceItem {
  id: string;
  supplierName: string;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  statutoryDueDate: string;
  amountPaise: number;
  paidPaise: number;
  unpaidPaise: number;
  daysOverdue: number;
  accruedInterestPaise: number;
  disallowedUnder43Bh: boolean;
}

interface RiskTableProps {
  invoices: BuyerInvoiceItem[];
  buyerName: string;
}

export function RiskTable({ invoices, buyerName }: RiskTableProps) {
  const totalExposurePaise = invoices
    .filter((inv) => inv.disallowedUnder43Bh)
    .reduce((sum, inv) => sum + inv.unpaidPaise, 0);

  const totalInterestExposurePaise = invoices.reduce(
    (sum, inv) => sum + inv.accruedInterestPaise,
    0
  );

  return (
    <div className="space-y-6">
      {/* 43B(h) Summary KPI Exposure Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl border border-red-500/30 shadow-xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
              Section 43B(h) Disallowance Risk
            </span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {formatPaiseToINR(totalExposurePaise)}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unpaid MSME dues beyond statutory limit. Deductible only in the year payment is actually released.
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              Compound Interest Accrued (s.16)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            {formatPaiseToINR(totalInterestExposurePaise)}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compound interest payable at 3× RBI Bank Rate under Section 16 of the MSMED Act.
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              Total Invoices Under Audit
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {invoices.length} Invoices
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supplied by verified Micro &amp; Small manufacturing/service enterprises.
          </p>
        </div>
      </div>

      {/* Indicative Disclaimer Tooltip Box */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-xs text-amber-200/90 backdrop-blur-sm">
        <InfoTooltip />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-300">Statutory Tax &amp; Legal Context: </span>
          Section 43B(h) exposure is computed deterministically for corporate buyers. An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost. Review with a CA/lawyer before filing.
        </div>
      </div>

      {/* Invoices Risk Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">
              MSME Supplier Dues &amp; Appointed Day Matrix ({buyerName})
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Evaluation
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            As of {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[11px]">
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Acceptance Date</th>
                <th className="p-3.5">Statutory Due Date</th>
                <th className="p-3.5">Days Overdue</th>
                <th className="p-3.5 text-right">Unpaid Principal</th>
                <th className="p-3.5 text-right">Accrued 3× Interest</th>
                <th className="p-3.5 text-center">43B(h) Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    inv.disallowedUnder43Bh ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="p-3.5 font-bold text-white">{inv.supplierName}</td>
                  <td className="p-3.5 font-mono text-slate-300">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                      {inv.invoiceNo}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{inv.acceptanceDate}</td>
                  <td className="p-3.5 text-slate-300 font-semibold font-mono">{inv.statutoryDueDate}</td>
                  <td className="p-3.5">
                    {inv.daysOverdue > 0 ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold font-mono rounded-full text-[10px]">
                        {inv.daysOverdue} days late
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono rounded-full text-[10px]">
                        Within limit
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-bold font-mono text-white">
                    {formatPaiseToINR(inv.unpaidPaise)}
                  </td>
                  <td className="p-3.5 text-right text-emerald-400 font-bold font-mono">
                    {formatPaiseToINR(inv.accruedInterestPaise)}
                  </td>
                  <td className="p-3.5 text-center">
                    {inv.disallowedUnder43Bh ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                        Disallowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                        Allowed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoTooltip() {
  return (
    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
