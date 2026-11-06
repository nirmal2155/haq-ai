'use client';

import React from 'react';
import { formatPaiseToINR } from '@/engine/money';
import { Percent, TrendingUp, Info } from 'lucide-react';

interface InterestCardProps {
  unpaidPaise: number;
  paidPaise: number;
  daysOverdue: number;
  interestPaise: number;
  totalPaise: number;
  effectiveRatePercent: number;
  bankRatePercent: number;
}

export function InterestCard({
  unpaidPaise,
  paidPaise,
  daysOverdue,
  interestPaise,
  totalPaise,
  effectiveRatePercent,
  bankRatePercent,
}: InterestCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Statutory Interest Calculation (MSMED Act Sec 16)
        </h3>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded">
          Monthly Rests Compounding
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block">Unpaid Principal</span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">
            {formatPaiseToINR(unpaidPaise)}
          </span>
          {paidPaise > 0 && (
            <span className="text-[10px] text-slate-400">
              Paid: {formatPaiseToINR(paidPaise)}
            </span>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block">Applicable Statutory Rate</span>
          <span className="text-sm font-bold text-emerald-700 block mt-0.5">
            {effectiveRatePercent.toFixed(2)}% p.a.
          </span>
          <span className="text-[10px] text-slate-400">
            3 × RBI Bank Rate ({bankRatePercent.toFixed(2)}%)
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block">Days Overdue</span>
          <span className={`text-sm font-bold block mt-0.5 ${daysOverdue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {daysOverdue} Days
          </span>
          <span className="text-[10px] text-slate-400">
            Past Section 15 statutory limit
          </span>
        </div>
      </div>

      {/* Claim Summary Box */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-900 block">
            Accrued Statutory Compound Interest:
          </span>
          <span className="text-lg font-black text-emerald-700">
            {formatPaiseToINR(interestPaise)}
          </span>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-700 block">
            Total Statutory Claim (Principal + Interest):
          </span>
          <span className="text-xl font-black text-slate-900">
            {formatPaiseToINR(totalPaise)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          Computed deterministically via Decimal.js. Unpaid MSME interest cannot be waived by any bilateral contract.
        </span>
      </div>
    </div>
  );
}
