'use client';

import React, { useState } from 'react';
import { RiskTable, BuyerInvoiceItem } from '@/components/RiskTable';
import { SEED_DATA, SeedInvoice } from '@/lib/seedData';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { Building2, ShieldAlert } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Corporate Buyer Risk Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Section 43B(h) Income Tax Exposure & MSMED Act Statutory Liability
          </p>
        </div>

        {/* Corporate Buyer Entity Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold shadow-sm">
          <span className="text-slate-500 pl-2">Corporate Entity:</span>
          <select
            value={selectedBuyer}
            onChange={(e) => setSelectedBuyer(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
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
