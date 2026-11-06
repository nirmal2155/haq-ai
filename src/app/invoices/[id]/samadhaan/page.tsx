'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, AlertCircle, CheckSquare, ExternalLink } from 'lucide-react';

interface PortalField {
  label: string;
  value: string;
  helperText: string;
}

export default function SamadhaanKitPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Field by field mapping for the official MSME Samadhaan portal
  const portalFields: PortalField[] = [
    {
      label: 'Supplier Udyam Registration Number',
      value: 'UDYAM-GJ-01-0012345',
      helperText: 'Your 19-character enterprise registration number',
    },
    {
      label: 'Supplier Category',
      value: 'Micro Enterprise (Manufacturing & Services)',
      helperText: 'Must match your Udyam Certificate exactly',
    },
    {
      label: 'Buyer Name',
      value: 'Tata Motors Limited',
      helperText: 'Legal name of the respondent debtor corporate',
    },
    {
      label: 'Buyer GSTIN',
      value: '27AAACT2727Q1ZW',
      helperText: 'Required on the portal for state jurisdiction routing',
    },
    {
      label: 'Invoice / Bill Number',
      value: 'INV-2026-089',
      helperText: 'Primary invoice document number under dispute',
    },
    {
      label: 'Invoice Date',
      value: '2026-01-10',
      helperText: 'Date stated on the tax invoice',
    },
    {
      label: 'Goods / Service Acceptance Date',
      value: '2026-01-15',
      helperText: 'Physical delivery challan or deemed acceptance date',
    },
    {
      label: 'Statutory Due Date (Section 15)',
      value: '2026-02-14',
      helperText: 'Calculated deterministically (capped to 45 days)',
    },
    {
      label: 'Principal Amount Claimed (₹)',
      value: '8,50,000.00',
      helperText: 'Outstanding principal unpaid dues',
    },
    {
      label: 'Accrued Statutory Interest Claimed (₹)',
      value: '1,17,458.00',
      helperText: 'Compounded with monthly rests at 3x RBI Bank Rate',
    },
    {
      label: 'Total Claim Amount (₹)',
      value: '9,67,458.00',
      helperText: 'Principal plus accrued compound interest',
    },
  ];

  const documentsChecklist = [
    'Copy of Tax Invoice / Invoices under dispute',
    'Proof of Delivery / Signed Delivery Challan / Lorry Receipt (LR copy)',
    'Purchase Order (PO) or Agreement (if applicable)',
    'Valid Udyam Registration Certificate',
    'Bank Account statement / Ledger extract demonstrating non-receipt of payment',
    'Copy of Statutory Legal Demand Notice served to Buyer',
  ];

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <a
          href="https://samadhaan.msme.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition"
        >
          <span>Open Official MSME Samadhaan Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            MSME Samadhaan Portal Filing Kit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Field-by-field reference and checklist for filing a case before the Micro & Small Facilitation Council (MSEFC).
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block">
              Notice: Manual Verification Required
            </span>
            <p>
              In strict accordance with Haq AI hard rules, we do not automate or scrape government portals.
              Copy the validated figures below and paste them into the official government form at samadhaan.msme.gov.in.
              <strong> Verify the current portal form before filing.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Field-by-Field Copy Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Step 1: Copy-Paste Data into Portal Fields
        </h2>

        <div className="divide-y divide-slate-100">
          {portalFields.map((field, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-md">
                <span className="text-xs font-semibold text-slate-700 block">{field.label}</span>
                <span className="text-[11px] text-slate-400 block">{field.helperText}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-medium text-slate-900 select-all">
                  {field.value}
                </span>
                <button
                  onClick={() => handleCopy(`field-${idx}`, field.value)}
                  className="p-1.5 border border-slate-300 hover:bg-slate-100 rounded text-slate-600 transition"
                  title="Copy value"
                >
                  {copiedKey === `field-${idx}` ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Document Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          Step 2: Mandatory Documents Checklist (PDF format, &lt; 2 MB each on portal)
        </h2>

        <ul className="space-y-2.5 text-xs text-slate-700">
          {documentsChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id={`doc-${i}`}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500"
              />
              <label htmlFor={`doc-${i}`} className="cursor-pointer font-medium leading-snug">
                {item}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
