'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calculator,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileCheck2,
  Scale,
  Percent,
} from 'lucide-react';
import { computeInterest } from '@/engine/interest';
import { computeAppointedDay } from '@/engine/deadline';
import { rupeesToPaise, formatPaiseToINR, paiseToRupees } from '@/engine/money';
import { getBankRate } from '@/engine/rates';

export function StudioPlayground() {
  const [amountRupees, setAmountRupees] = useState<number>(500000); // ₹5,00,000
  const [agreedDays, setAgreedDays] = useState<number>(15); // 15 statutory default
  const [daysOverdue, setDaysOverdue] = useState<number>(60); // 60 days overdue
  const [hasAgreement, setHasAgreement] = useState<boolean>(false);

  // Compute live deterministic metrics
  const liveCalculation = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0] ?? '';

    // Calculate dates backwards based on daysOverdue
    const invoiceDateObj = new Date(today.getTime() - (agreedDays + daysOverdue) * 24 * 60 * 60 * 1000);
    const invoiceDateStr = invoiceDateObj.toISOString().split('T')[0] ?? '';

    const appointedDay = computeAppointedDay({
      invoiceDate: invoiceDateStr,
      deliveryDate: invoiceDateStr,
      agreedPaymentDays: hasAgreement ? agreedDays : undefined,
    });

    const principalPaise = rupeesToPaise(amountRupees);

    const interestResult = computeInterest({
      principalPaise,
      dueDate: appointedDay.appointedDayStr,
      asOfDate: todayStr,
    });

    const currentRate = getBankRate(todayStr);
    const annualRate = currentRate.bankRatePct * 3; // 20.25%

    // Standard simple bank interest (at 6.75%) for comparison
    const simpleBankInterestRupees = Math.round(
      (amountRupees * (currentRate.bankRatePct / 100) * daysOverdue) / 365
    );

    const interestRupees = Math.round(interestResult.interestPaise / 100);
    const totalRupees = Math.round(interestResult.totalPaise / 100);

    return {
      appointedDayStr: appointedDay.appointedDayStr,
      ruleApplied: appointedDay.rule,
      cappedTo45: appointedDay.rule === '45_DAY_STATUTORY_CAP',
      principalPaise,
      interestPaise: interestResult.interestPaise,
      totalPaise: interestResult.totalPaise,
      interestRupees,
      totalRupees,
      annualRate,
      bankRatePct: currentRate.bankRatePct,
      simpleBankInterestRupees,
      differenceRupees: Math.max(0, interestRupees - simpleBankInterestRupees),
    };
  }, [amountRupees, agreedDays, daysOverdue, hasAgreement]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            Live Statutory Engine Playground
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            MSMED Act s.15 & s.16
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Engine:</span>
          <span className="text-emerald-400 font-semibold">Decimal.js (Zero-Math AI)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-5 p-6 space-y-6 bg-slate-950/40">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Invoice Principal Amount
              </label>
              <span className="text-sm font-mono font-bold text-emerald-400">
                ₹{amountRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={25000}
              max={5000000}
              step={25000}
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹25,000</span>
              <span>₹25 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* Agreement Toggle */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Written Agreement Days
              </label>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {hasAgreement ? `${agreedDays} Days (Max 45)` : '15 Days (Default Law)'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setHasAgreement(false);
                  setAgreedDays(15);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  !hasAgreement
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                No Agreement (15 Days)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAgreement(true);
                  setAgreedDays(45);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  hasAgreement
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                Written PO (Up to 45)
              </button>
            </div>
          </div>

          {/* Days Overdue Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Days Overdue Past Statutory Due Date
              </label>
              <span className="text-sm font-mono font-bold text-amber-400">
                {daysOverdue} Days
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={365}
              step={1}
              value={daysOverdue}
              onChange={(e) => setDaysOverdue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Day 1</span>
              <span>Day 90</span>
              <span>1 Year (365d)</span>
            </div>
          </div>

          {/* Statutory Insight Badge */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Scale className="w-4 h-4" />
              <span>MSMED Section 16 Rate Mandate</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Calculated at <span className="text-slate-200 font-mono font-bold">3× RBI Bank Rate ({liveCalculation.bankRatePct}% × 3 = {liveCalculation.annualRate}%)</span> compounded with monthly rests. This liability cannot be waived or written off in contracts.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Output Display */}
        <div className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Main Calculated Result Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Total Statutory Debt Enforceable
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Samadhaan Claim
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Total Payable Claim</span>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-0.5">
                    {formatPaiseToINR(liveCalculation.totalPaise)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Principal + Accrued Compound Interest
                  </span>
                </div>

                <div className="sm:border-l sm:border-slate-800/80 sm:pl-4">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Accrued Compound Interest (3× RBI)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight mt-0.5">
                    +{formatPaiseToINR(liveCalculation.interestPaise)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Compounded monthly over {daysOverdue} days
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Bar: Standard vs MSMED Statutory Law */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Statutory MSMED Interest vs Normal Bank Interest
                </span>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  +{formatPaiseToINR(rupeesToPaise(liveCalculation.differenceRupees))} extra statutory benefit
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Haq AI MSMED s.16 (20.25% Monthly Compounded)</span>
                    <span className="font-mono font-semibold text-emerald-400">₹{liveCalculation.interestRupees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Ordinary Simple Bank Rate (6.75% Simple)</span>
                    <span className="font-mono text-slate-400">₹{liveCalculation.simpleBankInterestRupees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{
                        width: `${Math.max(10, Math.min(100, (liveCalculation.simpleBankInterestRupees / (liveCalculation.interestRupees || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 43B(h) Corporate Buyer Lever */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong className="text-amber-300 block font-semibold mb-0.5">
                  Income Tax Section 43B(h) Corporate Tax Leverage:
                </strong>
                Because this invoice is unpaid past statutory appointed day ({liveCalculation.appointedDayStr}), the corporate buyer faces tax disallowance at year-end. The expense cannot be deducted until payment is actually released.
              </div>
            </div>
          </div>

          {/* Call to action within the simulator */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-400">
              Want to calculate this on your actual invoices?
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/invoices/new"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all min-h-[38px]"
              >
                <span>Upload Invoice (OCR)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all min-h-[38px]"
              >
                <span>Supplier Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
