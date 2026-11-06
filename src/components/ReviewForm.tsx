'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { computeDueDate } from '@/engine/deadline';
import { rupeesToPaise, formatPaiseToINR } from '@/engine/money';
import { useAuth } from '@/lib/useAuth';

interface ReviewFormProps {
  initialData: {
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
  };
  source?: {
    storagePath: string;
    mime: string;
    sha256: string;
  };
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
    <form onSubmit={handleSaveConfirmed} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Review & Verify Extracted Fields</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review extracted data carefully. In accordance with Haq AI security rules, no unverified model output is saved directly.
        </p>
      </div>

      {initialData.fieldsNeedingReview.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Fields flagged for manual review:</span>{' '}
            {initialData.fieldsNeedingReview.join(', ')}. Please verify these against your physical document.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Buyer / Corporate Entity Name *
          </label>
          <input
            type="text"
            required
            value={formData.buyerName}
            onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
              needsReview('buyerName') ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
            }`}
          />
        </div>

        {/* Buyer GSTIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Buyer GSTIN (15 digits)
          </label>
          <input
            type="text"
            placeholder="e.g. 27AAACT2727Q1ZW"
            value={formData.buyerGstin}
            onChange={(e) => setFormData({ ...formData, buyerGstin: e.target.value.toUpperCase() })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
              needsReview('buyerGstin') ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
            }`}
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Invoice Number *
          </label>
          <input
            type="text"
            required
            value={formData.invoiceNo}
            onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
              needsReview('invoiceNo') ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
            }`}
          />
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Invoice Issue Date *
          </label>
          <input
            type="date"
            required
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Acceptance Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Goods / Service Acceptance Date *
          </label>
          <input
            type="date"
            required
            value={formData.acceptanceDate}
            onChange={(e) => setFormData({ ...formData, acceptanceDate: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
              needsReview('acceptanceDate') ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
            }`}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            MSMED Act calculates deadlines from acceptance or deemed acceptance, not invoice date.
          </p>
        </div>

        {/* Amount in Rupees */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Invoice Amount (₹) *
          </label>
          <input
            type="text"
            required
            value={formData.amountRupees}
            onChange={(e) => setFormData({ ...formData, amountRupees: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
              needsReview('amountRupees') ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
            }`}
          />
          {parsedPaise > 0 && (
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              Paise Storage: {parsedPaise.toLocaleString()} paise ({formatPaiseToINR(parsedPaise)})
            </p>
          )}
        </div>
      </div>

      {/* Contractual Terms */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="agreementCheck"
            checked={formData.hasWrittenAgreement}
            onChange={(e) => setFormData({ ...formData, hasWrittenAgreement: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <label htmlFor="agreementCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
            Written contract or Purchase Order exists specifying credit terms
          </label>
        </div>

        {formData.hasWrittenAgreement && (
          <div className="pl-6 pt-1">
            <label className="block text-xs text-slate-600 mb-1">
              Agreed Credit Days (Max legal cap under Section 15 is 45 days):
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.agreedCreditDays ?? 30}
              onChange={(e) => setFormData({ ...formData, agreedCreditDays: Number(e.target.value) })}
              className="w-32 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Statutory Deadline Calculation Preview */}
      {calculatedDeadline && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="font-semibold text-emerald-950">Statutory Due Date: </span>
            <span className="font-bold text-emerald-700">{calculatedDeadline.dueDate}</span>
            <div className="text-slate-600 text-xs mt-0.5">
              Rule: {calculatedDeadline.rule} ({calculatedDeadline.effectiveCreditDays} days credit)
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">
              MSMED Section 15
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold shadow transition flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Confirm & Save to Dashboard'}
        </button>
      </div>
    </form>
  );
}
