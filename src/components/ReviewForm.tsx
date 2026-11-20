'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { computeDueDate } from '@/engine/deadline';
import { rupeesToPaise, formatPaiseToINR } from '@/engine/money';
import { useAuth } from '@/lib/useAuth';

export interface ExtractedInvoiceFormInput {
  buyerName: string;
  buyerGstin: string | null;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string | null;
  amountRupees: string;
  hasWrittenAgreement: boolean;
  agreedCreditDays: number | null;
  fieldsNeedingReview: string[];
  amountPaise: number;
}

export interface ExtractedInvoiceSource {
  storagePath: string;
  mime: string;
  sha256: string;
}

export interface ReviewFormProps {
  initialData: ExtractedInvoiceFormInput;
  source?: ExtractedInvoiceSource;
}

export function ReviewForm({ initialData, source }: ReviewFormProps) {
  const router = useRouter();
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    buyerName: initialData.buyerName || '',
    buyerGstin: initialData.buyerGstin || '',
    invoiceNo: initialData.invoiceNo || '',
    invoiceDate: initialData.invoiceDate || '',
    acceptanceDate: initialData.acceptanceDate || initialData.invoiceDate || '',
    amountRupees: initialData.amountRupees || '0.00',
    hasWrittenAgreement: initialData.hasWrittenAgreement ?? false,
    agreedCreditDays: initialData.agreedCreditDays ?? 30,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const needsReview = (field: string) => initialData.fieldsNeedingReview.includes(field);

  // Compute preview due date deterministically
  let calculatedDeadline = null;
  let parsedPaise = 0;
  try {
    parsedPaise = rupeesToPaise(formData.amountRupees);
    if (formData.acceptanceDate) {
      calculatedDeadline = computeDueDate({
        acceptanceDate: formData.acceptanceDate,
        hasWrittenAgreement: formData.hasWrittenAgreement,
        agreedCreditDays: formData.hasWrittenAgreement ? formData.agreedCreditDays : null,
      });
    }
  } catch (e) {
    // Graceful fallback during editing
  }

  const handleSaveConfirmed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const paise = rupeesToPaise(formData.amountRupees);

      const payload = {
        buyerName: formData.buyerName.trim(),
        buyerGstin: formData.buyerGstin.trim() || null,
        invoiceNo: formData.invoiceNo.trim(),
        invoiceDate: formData.invoiceDate,
        acceptanceDate: formData.acceptanceDate,
        deemedAcceptance: formData.acceptanceDate !== formData.invoiceDate,
        amountPaise: paise,
        paidPaise: 0,
        hasWrittenAgreement: formData.hasWrittenAgreement,
        agreedCreditDays: formData.hasWrittenAgreement ? Number(formData.agreedCreditDays) : null,
        source,
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save invoice');
      }

      router.push(`/dashboard`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error saving invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveConfirmed} className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Human Verification Step
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Review &amp; Verify Extracted Fields</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review extracted data carefully. In accordance with Haq AI security rules, no unverified model output is saved directly.
        </p>
      </div>

      {initialData.fieldsNeedingReview.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-xs text-amber-200/90 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Fields flagged for manual review:</span>{' '}
            {initialData.fieldsNeedingReview.join(', ')}. Please verify these against your physical document.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Buyer Name */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Buyer / Corporate Entity Name *
          </label>
          <input
            type="text"
            required
            value={formData.buyerName}
            onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border text-white focus:ring-2 focus:ring-blue-500/40 outline-none ${
              needsReview('buyerName') ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800'
            }`}
          />
        </div>

        {/* Buyer GSTIN */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Buyer GSTIN (15 digits)
          </label>
          <input
            type="text"
            placeholder="e.g. 27AAACT2727Q1ZW"
            value={formData.buyerGstin}
            onChange={(e) => setFormData({ ...formData, buyerGstin: e.target.value.toUpperCase() })}
            className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border text-white focus:ring-2 focus:ring-blue-500/40 outline-none ${
              needsReview('buyerGstin') ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800'
            }`}
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Invoice Number *
          </label>
          <input
            type="text"
            required
            value={formData.invoiceNo}
            onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border text-white focus:ring-2 focus:ring-blue-500/40 outline-none ${
              needsReview('invoiceNo') ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800'
            }`}
          />
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Invoice Issue Date *
          </label>
          <input
            type="date"
            required
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500/40 outline-none"
          />
        </div>

        {/* Acceptance Date */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Goods / Service Acceptance Date *
          </label>
          <input
            type="date"
            required
            value={formData.acceptanceDate}
            onChange={(e) => setFormData({ ...formData, acceptanceDate: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border text-white focus:ring-2 focus:ring-blue-500/40 outline-none ${
              needsReview('acceptanceDate') ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800'
            }`}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            MSMED Act calculates deadlines from acceptance or deemed acceptance, not invoice date.
          </p>
        </div>

        {/* Amount in Rupees */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Invoice Principal Amount (₹) *
          </label>
          <input
            type="text"
            required
            value={formData.amountRupees}
            onChange={(e) => setFormData({ ...formData, amountRupees: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border text-white focus:ring-2 focus:ring-blue-500/40 outline-none ${
              needsReview('amountRupees') ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800'
            }`}
          />
          {parsedPaise > 0 && (
            <p className="text-[11px] text-emerald-400 font-mono mt-1">
              Paise Storage: {parsedPaise.toLocaleString()} paise ({formatPaiseToINR(parsedPaise)})
            </p>
          )}
        </div>
      </div>

      {/* Contractual Terms */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="agreementCheck"
            checked={formData.hasWrittenAgreement}
            onChange={(e) => setFormData({ ...formData, hasWrittenAgreement: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
          />
          <label htmlFor="agreementCheck" className="text-xs font-medium text-slate-300 cursor-pointer">
            Written contract or Purchase Order exists specifying credit terms
          </label>
        </div>

        {formData.hasWrittenAgreement && (
          <div className="pl-6 pt-1">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Agreed Credit Days (Max legal cap under Section 15 is 45 days):
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.agreedCreditDays ?? 30}
              onChange={(e) => setFormData({ ...formData, agreedCreditDays: Number(e.target.value) })}
              className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500/40 outline-none"
            />
          </div>
        )}
      </div>

      {/* Statutory Deadline Calculation Preview */}
      {calculatedDeadline && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs backdrop-blur-sm">
          <div>
            <span className="font-semibold text-slate-300">Statutory Due Date: </span>
            <span className="font-bold text-emerald-400 font-mono text-sm ml-1">{calculatedDeadline.dueDate}</span>
            <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
              Rule: {calculatedDeadline.rule} ({calculatedDeadline.effectiveCreditDays} days credit limit)
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
              MSMED s.15 Appointed Day
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-300 font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-mono transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-semibold shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Confirm & Register in Studio'}
        </button>
      </div>
    </form>
  );
}
