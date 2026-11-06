'use client';

import React, { useState } from 'react';
import { Copy, Check, Printer, AlertCircle, FileText } from 'lucide-react';

interface NoticePreviewProps {
  invoiceId: string;
  initialNotice: {
    finalBody: string;
    summaryLocal: string;
    lang: string;
    fallbackUsed: boolean;
  };
  onLanguageChange: (lang: 'en' | 'hi' | 'gu') => void;
  isLoading: boolean;
}

export function NoticePreview({
  invoiceId,
  initialNotice,
  onLanguageChange,
  isLoading,
}: NoticePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(initialNotice.finalBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Statutory Legal Demand Notice
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            MSMED Act 2006 Sections 15 & 16 · Drafted by Haq AI
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Language:</span>
          <select
            value={initialNotice.lang}
            onChange={(e) => onLanguageChange(e.target.value as 'en' | 'hi' | 'gu')}
            disabled={isLoading}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="en">English (Statutory Standard)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
          </select>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold uppercase tracking-wider block mb-0.5">
            Draft only. Review with a CA/lawyer before sending.
          </span>
          This generated legal demand notice is a drafting and decision-support tool. It computes statutory rights and interest mathematically under the MSMED Act, 2006, but does not constitute an attorney-client relationship.
        </div>
      </div>

      {/* 3-line local summary */}
      {initialNotice.summaryLocal && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Executive Summary / सारांश / સારાંશ:
          </div>
          <p className="text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
            {initialNotice.summaryLocal}
          </p>
        </div>
      )}

      {/* Fallback warning if LLM altered numbers */}
      {initialNotice.fallbackUsed && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Security Fallback Applied:</strong> Translation was replaced with the deterministic English legal template to preserve 100% mathematical integrity of statutory figures.
        </div>
      )}

      {/* Legal Notice Document Display */}
      <div className="relative">
        <div className="absolute top-3 right-3 flex items-center gap-2 print:hidden">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-sm transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>

        <pre className="p-6 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800">
          {initialNotice.finalBody}
        </pre>
      </div>
    </div>
  );
}
