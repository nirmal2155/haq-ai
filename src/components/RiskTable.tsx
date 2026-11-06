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
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Section 43B(h) Tax Disallowance Risk
            </span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPaiseToINR(totalExposurePaise)}
          </div>
          <p className="text-xs text-slate-500">
            Unpaid MSME dues beyond statutory limit. Cannot be deducted as business expense until paid.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Statutory Compound Interest Liability
            </span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPaiseToINR(totalInterestExposurePaise)}
          </div>
          <p className="text-xs text-slate-500">
            Compound interest payable at 3× RBI Bank Rate under Section 16 of MSMED Act.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Total Invoices Under Review
            </span>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {invoices.length} Invoices
          </div>
          <p className="text-xs text-slate-500">
            From verified Micro & Small registered suppliers.
          </p>
        </div>
      </div>

      {/* Indicative Disclaimer Tooltip Box */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
        <InfoTooltip />
        <div>
          <span className="font-bold">Indicative Assessment Only: </span>
          Section 43B(h) exposure is computed as decision-support for corporate buyers. It highlights unpaid invoices exceeding the statutory MSMED limits (15/45 days). This is indicative, not legal or tax advice. Consult your Chartered Accountant for corporate tax filings.
        </div>
      </div>

      {/* Invoices Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            MSME Supplier Dues & Statutory Due Date Matrix ({buyerName})
          </h3>
          <span className="text-xs text-slate-500">
            Live evaluation as of {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Acceptance Date</th>
                <th className="p-3.5">Statutory Due Date</th>
                <th className="p-3.5">Days Overdue</th>
                <th className="p-3.5 text-right">Unpaid Principal</th>
                <th className="p-3.5 text-right">Accrued 3x Interest</th>
                <th className="p-3.5 text-center">43B(h) Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    inv.disallowedUnder43Bh ? 'bg-red-50/20' : ''
                  }`}
                >
                  <td className="p-3.5 font-bold text-slate-900">{inv.supplierName}</td>
                  <td className="p-3.5 font-mono text-slate-700">{inv.invoiceNo}</td>
                  <td className="p-3.5 text-slate-600">{inv.acceptanceDate}</td>
                  <td className="p-3.5 text-slate-800 font-semibold">{inv.statutoryDueDate}</td>
                  <td className="p-3.5">
                    {inv.daysOverdue > 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-full">
                        {inv.daysOverdue} days late
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Within limit
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    {formatPaiseToINR(inv.unpaidPaise)}
                  </td>
                  <td className="p-3.5 text-right text-emerald-700 font-bold">
                    {formatPaiseToINR(inv.accruedInterestPaise)}
                  </td>
                  <td className="p-3.5 text-center">
                    {inv.disallowedUnder43Bh ? (
                      <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        Disallowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
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
