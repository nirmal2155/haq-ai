'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface TimelineProps {
  invoiceDate: string;
  acceptanceDate: string;
  dueDate: string;
  daysOverdue: number;
  statutoryRule: string;
  isDeemedAcceptance?: boolean;
}

export function Timeline({
  invoiceDate,
  acceptanceDate,
  dueDate,
  daysOverdue,
  statutoryRule,
  isDeemedAcceptance,
}: TimelineProps) {
  const isOverdue = daysOverdue > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
        MSMED Act Statutory Timeline
      </h3>

      <div className="relative border-l-2 border-emerald-500 ml-4 pl-6 space-y-6 my-2">
        {/* Step 1: Invoice Date */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 bg-emerald-100 text-emerald-700 p-1 rounded-full border-2 border-emerald-500">
            <Calendar className="w-3.5 h-3.5" />
          </span>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Invoice Raised</span>
            <span className="text-slate-500 font-mono">{invoiceDate}</span>
          </div>
        </div>

        {/* Step 2: Acceptance Date */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 bg-emerald-100 text-emerald-700 p-1 rounded-full border-2 border-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              Goods/Services Acceptance {isDeemedAcceptance && '(Deemed under Sec 2(b))'}
            </span>
            <span className="text-slate-500 font-mono">{acceptanceDate}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Clock for Section 15 begins strictly from this date.
            </span>
          </div>
        </div>

        {/* Step 3: Statutory Due Date */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 bg-blue-100 text-blue-700 p-1 rounded-full border-2 border-blue-500">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div className="text-xs">
            <span className="font-bold text-blue-950 block">Statutory Payment Due Date</span>
            <span className="text-blue-700 font-mono font-bold">{dueDate}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Rule applied: <strong className="text-slate-700">{statutoryRule}</strong>
            </span>
          </div>
        </div>

        {/* Step 4: Current Status / Overdue */}
        <div className="relative">
          <span
            className={`absolute -left-[31px] top-0.5 p-1 rounded-full border-2 ${
              isOverdue
                ? 'bg-red-100 text-red-700 border-red-500'
                : 'bg-emerald-100 text-emerald-700 border-emerald-500'
            }`}
          >
            {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </span>
          <div className="text-xs">
            <span className={`font-bold block ${isOverdue ? 'text-red-700' : 'text-emerald-700'}`}>
              {isOverdue ? `Overdue by ${daysOverdue} Days` : 'On-Time / Within Statutory Limit'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isOverdue
                ? 'Compound interest accruing daily with monthly rests under Section 16.'
                : 'Payment is within the allowed statutory credit period.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
