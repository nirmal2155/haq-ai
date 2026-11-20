'use client';

import React, { useState } from 'react';
import { UploadCard } from '@/components/UploadCard';
import { ReviewForm, ExtractedInvoiceFormInput, ExtractedInvoiceSource } from '@/components/ReviewForm';

export default function NewInvoicePage() {
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceFormInput | null>(null);
  const [sourceInfo, setSourceInfo] = useState<ExtractedInvoiceSource | null>(null);

  const handleExtraction = (extracted: ExtractedInvoiceFormInput, source?: ExtractedInvoiceSource) => {
    setExtractedData(extracted);
    setSourceInfo(source || null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Multimodal OCR Vision Pipeline
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Register MSME Statutory Invoice
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload an invoice or delivery challan. Google AI multimodal vision extracts structured metadata for human review before statutory calculation.
        </p>
      </div>

      {!extractedData ? (
        <UploadCard onExtractionSuccess={handleExtraction} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300 backdrop-blur-sm gap-2">
            <span>✓ Document extracted via Google Gemini. Please verify and confirm all fields below.</span>
            <button
              onClick={() => {
                setExtractedData(null);
                setSourceInfo(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs font-mono"
            >
              Upload Different File
            </button>
          </div>
          <ReviewForm initialData={extractedData} source={sourceInfo || undefined} />
        </div>
      )}
    </div>
  );
}
