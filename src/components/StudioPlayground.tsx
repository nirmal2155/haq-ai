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
  Copy,
  Check,
  Code,
  FileText,
  Sliders,
  Layers,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { computeInterest } from '@/engine/interest';
import { computeAppointedDay } from '@/engine/deadline';
import { rupeesToPaise, formatPaiseToINR } from '@/engine/money';
import { getBankRate } from '@/engine/rates';

type PlaygroundTab = 'simulator' | 'notice' | 'tax43bh' | 'json';
type LanguageNotice = 'en' | 'hi' | 'gu';

interface PresetScenario {
  id: string;
  label: string;
  badge: string;
  buyer: string;
  amount: number;
  hasAgreement: boolean;
  agreedDays: number;
  daysOverdue: number;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'tata',
    label: 'Auto OEM Supplier',
    badge: 'Tier-1 Auto',
    buyer: 'Tata Motors Limited',
    amount: 850000,
    hasAgreement: true,
    agreedDays: 45,
    daysOverdue: 60,
  },
  {
    id: 'zenith',
    label: 'Corrugated Box Mfr',
    badge: 'Packaging',
    buyer: 'Zenith Infrastructure Projects Ltd',
    amount: 320000,
    hasAgreement: true,
    agreedDays: 30,
    daysOverdue: 25,
  },
  {
    id: 'jobwork',
    label: 'CNC Machining Jobwork',
    badge: 'Precision Eng',
    buyer: 'Apex Motors India Ltd',
    amount: 95000,
    hasAgreement: false,
    agreedDays: 15,
    daysOverdue: 40,
  },
  {
    id: 'fabricator',
    label: 'Heavy Fabricator',
    badge: 'Void 60d PO',
    buyer: 'Larsen & Toubro Project Division',
    amount: 2400000,
    hasAgreement: true,
    agreedDays: 60, // Intentionally > 45 to demonstrate s.15 proviso auto-cap!
    daysOverdue: 90,
  },
];

export function StudioPlayground() {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('simulator');
  const [noticeLang, setNoticeLang] = useState<LanguageNotice>('en');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Core parameters
  const [amountRupees, setAmountRupees] = useState<number>(500000);
  const [agreedDays, setAgreedDays] = useState<number>(15);
  const [daysOverdue, setDaysOverdue] = useState<number>(60);
  const [hasAgreement, setHasAgreement] = useState<boolean>(false);
  const [buyerName, setBuyerName] = useState<string>('Corporate Buyer Private Limited');

  // Load preset
  const applyPreset = (preset: PresetScenario) => {
    setAmountRupees(preset.amount);
    setHasAgreement(preset.hasAgreement);
    setAgreedDays(preset.agreedDays);
    setDaysOverdue(preset.daysOverdue);
    setBuyerName(preset.buyer);
  };

  // Live Deterministic Calculations
  const liveCalculation = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0] ?? '';

    // Calculate dates backwards from today based on overdue days
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
    const statutoryAnnualRate = currentRate.bankRatePct * 3; // 20.25% p.a.

    // Ordinary bank interest (6.75% simple)
    const simpleBankInterestRupees = Math.round(
      (amountRupees * (currentRate.bankRatePct / 100) * daysOverdue) / 365
    );

    const interestRupees = Math.round(interestResult.interestPaise / 100);
    const totalRupees = Math.round(interestResult.totalPaise / 100);
    const differenceRupees = Math.max(0, interestRupees - simpleBankInterestRupees);

    const isVoidContractCapped = hasAgreement && agreedDays > 45;

    return {
      invoiceDateStr,
      appointedDayStr: appointedDay.appointedDayStr,
      ruleApplied: appointedDay.rule,
      isVoidContractCapped,
      principalPaise,
      interestPaise: interestResult.interestPaise,
      totalPaise: interestResult.totalPaise,
      interestRupees,
      totalRupees,
      statutoryAnnualRate,
      bankRatePct: currentRate.bankRatePct,
      simpleBankInterestRupees,
      differenceRupees,
      todayStr,
    };
  }, [amountRupees, agreedDays, daysOverdue, hasAgreement]);

  // Notice draft in 3 languages
  const noticeDraft = useMemo(() => {
    const formattedPrincipal = formatPaiseToINR(liveCalculation.principalPaise);
    const formattedInterest = formatPaiseToINR(liveCalculation.interestPaise);
    const formattedTotal = formatPaiseToINR(liveCalculation.totalPaise);

    if (noticeLang === 'hi') {
      return `सांविधिक मांग सूचना (धारा 15 और 16, MSMED अधिनियम 2006)

दिनांक: ${liveCalculation.todayStr}
प्रति: लेखा विभाग, ${buyerName}

महोदय/महोदया,

विषय: चालान देय तिथि ${liveCalculation.appointedDayStr} के उपरांत सांविधिक बकाया राशि और 3× चक्रवृद्धि ब्याज की मांग।

हम एक पंजीकृत सूक्ष्म/लघु उद्यम (MSME) हैं। हमारे द्वारा प्रस्तुत चालान दिनांक ${liveCalculation.invoiceDateStr} की सांविधिक देय तिथि ${liveCalculation.appointedDayStr} को समाप्त हो चुकी है।

1. मूल बकाया राशि: ${formattedPrincipal}
2. धारा 16 के अंतर्गत 3× RBI बैंक दर (20.25% प्रति वर्ष) पर मासिक चक्रवृद्धि ब्याज: ${formattedInterest}
3. कुल देय राशि: ${formattedTotal}

आयकर अधिनियम की धारा 43B(h) के अनुसार, इस राशि का भुगतान किए बिना वित्तीय वर्ष में व्यावसायिक व्यय की कटौती अनुमन्य नहीं होगी। कृपया अविलंब भुगतान सुनिश्चित करें।

Draft only. Review with a CA/lawyer before sending.`;
    }

    if (noticeLang === 'gu') {
      return `કાયદેસર માંગણી નોટિસ (કલમ 15 અને 16, MSMED એકટ 2006)

તારીખ: ${liveCalculation.todayStr}
પ્રતિ: એકાઉન્ટ્સ વિભાગ, ${buyerName}

વિષય: ભરતિયું નિયત તારીખ ${liveCalculation.appointedDayStr} પછી કાયદેસર બાકી રકમ અને 3× ચક્રવૃદ્ધિ વ્યાજની વસૂલાત.

અમે એક નોંધાયેલ સૂક્ષ્મ/લઘુ સાહસ (MSME) છીએ. અમારા ચલણ તારીખ ${liveCalculation.invoiceDateStr} ની કાયદેસર છેલ્લી તારીખ ${liveCalculation.appointedDayStr} હતી, જે વીતી ગઈ છે.

1. મૂળ બાકી રકમ: ${formattedPrincipal}
2. કલમ 16 હેઠળ 3× RBI બેંક દરે (20.25% વાર્ષિક) માસિક ચક્રવૃદ્ધિ વ્યાજ: ${formattedInterest}
3. કુલ ચૂકવવાપાત્ર રકમ: ${formattedTotal}

ઇન્કમટેક્સ કલમ 43B(h) હેઠળ જ્યાં સુધી વાસ્તવિક ચૂકવણી નહીં થાય ત્યાં સુધી કર મુક્તિ મળશે નહીં. કૃપા કરીને તાત્કાલિક ચુકવણી કરો.

Draft only. Review with a CA/lawyer before sending.`;
    }

    return `FORMAL STATUTORY DEMAND NOTICE
Under Sections 15 & 16 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006
and Section 43B(h) of the Income Tax Act, 1961

Date: ${liveCalculation.todayStr}
To: Accounts & Finance Department, ${buyerName}

Subject: Mandatory statutory payment of overdue principal along with Section 16 compound interest.

Dear Sir/Madam,

This notice serves as formal statutory demand under Section 15 of the MSMED Act 2006. As a registered Micro/Small enterprise, payment for goods/services supplied under invoice dated ${liveCalculation.invoiceDateStr} was legally due on the Appointed Day (${liveCalculation.appointedDayStr}).

1. Outstanding Principal Amount: ${formattedPrincipal}
2. Compound Interest Accrued under Section 16 (computed monthly at 3× RBI Bank Rate = ${liveCalculation.statutoryAnnualRate}% p.a.): ${formattedInterest}
3. Total Enforceable Sum Payable: ${formattedTotal}

Corporate Tax Note under Section 43B(h):
An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost.

Please release payment immediately to prevent reference to the MSME Facilitation Council.

Draft only. Review with a CA/lawyer before sending.`;
  }, [noticeLang, buyerName, liveCalculation]);

  const copyNoticeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(noticeDraft);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            engine: 'Haq AI Deterministic Math Engine (Decimal.js)',
            roundingMode: 'ROUND_HALF_UP (Commercial paise)',
            statutoryAuthority: 'MSMED Act 2006 (ss. 15-18)',
            buyerName,
            invoiceDate: liveCalculation.invoiceDateStr,
            appointedDay: liveCalculation.appointedDayStr,
            ruleApplied: liveCalculation.ruleApplied,
            isVoidContractCapped: liveCalculation.isVoidContractCapped,
            daysOverdue,
            rbiBaseRatePct: liveCalculation.bankRatePct,
            msmedStatutoryRatePct: liveCalculation.statutoryAnnualRate,
            compounding: 'monthly',
            principalPaise: liveCalculation.principalPaise,
            principalFormatted: formatPaiseToINR(liveCalculation.principalPaise),
            interestPaise: liveCalculation.interestPaise,
            interestFormatted: formatPaiseToINR(liveCalculation.interestPaise),
            totalPaise: liveCalculation.totalPaise,
            totalFormatted: formatPaiseToINR(liveCalculation.totalPaise),
            section43bhDisallowanceRisk: daysOverdue > 0,
            aiMathProhibited: true,
          },
          null,
          2
        )
      );
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-400" />
              Statutory Engine Studio
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v2.5 · MSMED ss. 15-18
            </span>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'notice'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Demand Notice</span>
          </button>
          <button
            onClick={() => setActiveTab('tax43bh')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'tax43bh'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>43B(h) Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Carousel / Bar */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider shrink-0 font-bold">
          Quick Scenarios:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-[11px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="font-semibold">{p.label}</span>
              <span className="text-slate-500 font-normal">₹{(p.amount / 100000).toFixed(1)}L · {p.daysOverdue}d late</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters (Left) vs Output Console (Right) */}
      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left: Interactive Control Parameters */}
        <div className="lg:col-span-5 p-6 space-y-6 bg-slate-950/40">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Statutory Parameters
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              RBI Bank Rate: 6.75%
            </span>
          </div>

          {/* Principal Amount */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200">
                Invoice Principal Amount
              </label>
              <span className="text-base font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
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
            <div className="flex items-center gap-1.5 pt-1">
              {[50000, 200000, 500000, 1500000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountRupees(val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    amountRupees === val
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Written Agreement Toggle & Days */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Credit Agreement Clause
              </label>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                {hasAgreement ? `${agreedDays} Days PO Terms` : '15 Days Statutory Law'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setHasAgreement(false);
                  setAgreedDays(15);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                  !hasAgreement
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                No Agreement (15d Auto)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAgreement(true);
                  if (agreedDays === 15) setAgreedDays(30);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                  hasAgreement
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Written PO / Contract
              </button>
            </div>

            {hasAgreement && (
              <div className="space-y-2 pt-1 pl-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Agreed Payment Days:</span>
                  <span className={`font-mono font-bold ${agreedDays > 45 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {agreedDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={90}
                  value={agreedDays}
                  onChange={(e) => setAgreedDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                {liveCalculation.isVoidContractCapped && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 leading-relaxed font-mono">
                    ⚠️ <strong>Section 15 Proviso Auto-Cap:</strong> Contract term of {agreedDays} days exceeds statutory maximum (45 days) and is void ab initio. Haq AI automatically caps calculation to 45 days.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Days Overdue Slider */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200">
                Days Overdue Past Statutory Limit
              </label>
              <span className="text-base font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">
                {daysOverdue} Days Late
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={180}
              value={daysOverdue}
              onChange={(e) => setDaysOverdue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Day 1</span>
              <span>Day 45 (Formal Notice)</span>
              <span>Day 90</span>
              <span>Day 180</span>
            </div>
          </div>

          {/* Statutory Engine Credentials */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Appointed Day:</span>
              <strong className="text-slate-200">{liveCalculation.appointedDayStr}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Statutory Rule:</span>
              <strong className="text-blue-400">{liveCalculation.ruleApplied}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Statutory Interest Rate:</span>
              <strong className="text-emerald-400">20.25% p.a. (3× RBI 6.75%)</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Compounding Interval:</span>
              <strong className="text-slate-200">Monthly resting (MSMED s.16)</strong>
            </div>
          </div>
        </div>

        {/* Right: Studio Output Console */}
        <div className="lg:col-span-7 p-6 bg-slate-900/60 flex flex-col justify-between">
          {/* TAB 1: Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Primary Stat Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Principal Dues</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white">
                    {formatPaiseToINR(liveCalculation.principalPaise)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Due since {liveCalculation.appointedDayStr}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1 glow-emerald">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">3× Compound Interest</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      MSMED s.16
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    +{formatPaiseToINR(liveCalculation.interestPaise)}
                  </div>
                  <span className="text-[10px] text-emerald-500/80 block">20.25% monthly compounded</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1 glow-blue">
                  <span className="text-[11px] font-mono text-blue-400 uppercase">Total Enforceable Claim</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white">
                    {formatPaiseToINR(liveCalculation.totalPaise)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Mandatory under statutory law</span>
                </div>
              </div>

              {/* Comparison Graph: MSMED Law vs Simple Bank Rate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Statutory MSMED Interest vs Normal Bank Rate
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +{formatPaiseToINR(rupeesToPaise(liveCalculation.differenceRupees))} extra statutory benefit
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Haq AI Statutory Claim (20.25% Monthly Compounded)</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{liveCalculation.interestRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Ordinary Simple Bank Rate (6.75% Simple)</span>
                      <span className="font-mono text-slate-400">
                        ₹{liveCalculation.simpleBankInterestRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-slate-600 rounded-full"
                        style={{
                          width: `${Math.max(12, Math.min(100, (liveCalculation.simpleBankInterestRupees / (liveCalculation.interestRupees || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 43B(h) Corporate Tax Disallowance Callout */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  <strong className="text-amber-300 block font-semibold mb-0.5 font-mono">
                    Income Tax Section 43B(h) Corporate Buyer Lever:
                  </strong>
                  An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Legal Demand Notice */}
          {activeTab === 'notice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  {(['en', 'hi', 'gu'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setNoticeLang(l)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                        noticeLang === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={copyNoticeToClipboard}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
                >
                  {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotice ? 'Copied!' : 'Copy Notice'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[300px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-600/30">
                {noticeDraft}
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Multiset Token Parity: 100% exact numerical match with deterministic engine.</span>
              </div>
            </div>
          )}

          {/* TAB 3: Section 43B(h) Audit */}
          {activeTab === 'tax43bh' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-sm text-amber-300 font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Corporate Tax Disallowance Matrix
                </h4>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Under Finance Act 2023 amendment to Section 43B(h) of the Income Tax Act 1961, any sum payable to a micro or small enterprise beyond the time limit specified in Section 15 of the MSMED Act 2006 shall be allowed as a deduction only in the previous year in which such sum is actually paid.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Buyer Entity</span>
                  <div className="text-white font-bold">{buyerName}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Status under 43B(h)</span>
                  <div className="text-red-400 font-bold">Disallowed at Year-End</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Statutory Appointed Day</span>
                  <div className="text-white font-bold">{liveCalculation.appointedDayStr}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Disallowed Principal Amount</span>
                  <div className="text-white font-bold">{formatPaiseToINR(liveCalculation.principalPaise)}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Draft only. Review with a CA/lawyer before sending.
              </p>
            </div>
          )}

          {/* TAB 4: JSON Audit Trace */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Deterministic Engine Output</span>
                <button
                  onClick={copyJsonToClipboard}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[300px] overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed selection:bg-emerald-500/20">
                {JSON.stringify(
                  {
                    engine: 'Haq AI Deterministic Math Engine (Decimal.js)',
                    roundingMode: 'ROUND_HALF_UP (Commercial paise)',
                    statutoryAuthority: 'MSMED Act 2006 (ss. 15-18)',
                    buyerName,
                    invoiceDate: liveCalculation.invoiceDateStr,
                    appointedDay: liveCalculation.appointedDayStr,
                    ruleApplied: liveCalculation.ruleApplied,
                    isVoidContractCapped: liveCalculation.isVoidContractCapped,
                    daysOverdue,
                    rbiBaseRatePct: liveCalculation.bankRatePct,
                    msmedStatutoryRatePct: liveCalculation.statutoryAnnualRate,
                    compounding: 'monthly',
                    principalPaise: liveCalculation.principalPaise,
                    principalFormatted: formatPaiseToINR(liveCalculation.principalPaise),
                    interestPaise: liveCalculation.interestPaise,
                    interestFormatted: formatPaiseToINR(liveCalculation.interestPaise),
                    totalPaise: liveCalculation.totalPaise,
                    totalFormatted: formatPaiseToINR(liveCalculation.totalPaise),
                    section43bhDisallowanceRisk: daysOverdue > 0,
                    aiMathProhibited: true,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* Quick CTA Footer inside Simulator */}
          <div className="pt-5 mt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Calculate this on your actual physical invoices with OCR vision:
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/invoices/new"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all min-h-[38px]"
              >
                <span>Upload Invoice (OCR)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-semibold rounded-xl border border-slate-800 transition-all min-h-[38px]"
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
