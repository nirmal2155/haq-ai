'use client';

import React, { useState } from 'react';
import { RiskTable, BuyerInvoiceItem } from '@/components/RiskTable';
import { SEED_DATA, SeedInvoice } from '@/lib/seedData';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { ShieldAlert } from 'lucide-react';

export default function BuyerRiskPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<'buyer_apex' | 'buyer_zenith'>('buyer_apex');

  const buyerName =
    selectedBuyer === 'buyer_apex'
      ? 'Apex Motors India Ltd'
      : 'Zenith Infrastructure Projects Ltd';

  const today = new Date().toISOString().split('T')[0];

  // Map seed invoices matching selected buyer
  const buyerInvoices: BuyerInvoiceItem[] = SEED_DATA.invoices
    .filter((inv: SeedInvoice) =>
      selectedBuyer === 'buyer_apex'
        ? inv.buyerName.includes('Apex') || inv.buyerName.includes('Tata')
        : inv.buyerName.includes('Zenith')
    )
    .map((inv: SeedInvoice) => {
      const deadline = computeDueDate({
        acceptanceDate: inv.acceptanceDate,
        hasWrittenAgreement: inv.hasWrittenAgreement,
        agreedCreditDays: inv.agreedCreditDays,
      });

      const interest = computeInterest({
        principalPaise: inv.amountPaise,
        dueDate: deadline.dueDate,
        asOfDate: today,
        paidPaise: inv.paidPaise,
        config: DEFAULT_LEGAL_CONFIG,
      });

      const isDisallowed = interest.daysOverdue > 0;

      return {
        id: inv.id,
        supplierName: inv.supplierName,
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        acceptanceDate: inv.acceptanceDate,
        statutoryDueDate: deadline.dueDate,
        amountPaise: inv.amountPaise,
        paidPaise: inv.paidPaise,
        unpaidPaise: interest.unpaidPrincipalPaise,
        daysOverdue: interest.daysOverdue,
        accruedInterestPaise: interest.interestPaise,
        disallowedUnder43Bh: isDisallowed,
      };
    });

  return (
    <div className="space-y-6">
      {/* Header & Buyer Org Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              CA &amp; CFO Exposure Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Corporate Buyer Risk Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Section 43B(h) Income Tax disallowance exposure &amp; MSMED Act Section 16 statutory compound liability
          </p>
        </div>

        {/* Corporate Buyer Entity Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs font-semibold shadow-lg">
          <span className="text-slate-400 pl-2 font-mono text-[11px]">Audit Entity:</span>
          <select
            value={selectedBuyer}
            onChange={(e) => setSelectedBuyer(e.target.value as 'buyer_apex' | 'buyer_zenith')}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg font-medium text-slate-200 focus:ring-2 focus:ring-amber-500/50 outline-none"
          >
            <option value="buyer_apex">Apex Motors India Ltd</option>
            <option value="buyer_zenith">Zenith Infrastructure Projects Ltd</option>
          </select>
        </div>
      </div>

      {/* Main Risk Table */}
      <RiskTable invoices={buyerInvoices} buyerName={buyerName} />
    </div>
  );
}
