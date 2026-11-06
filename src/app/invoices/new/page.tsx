'use client';

import React, { useState } from 'react';
import { UploadCard } from '@/components/UploadCard';
import { ReviewForm } from '@/components/ReviewForm';

export default function NewInvoicePage() {
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [sourceInfo, setSourceInfo] = useState<any | null>(null);

  const handleExtraction = (extracted: any, source: any) => {
    setExtractedData(extracted);
    setSourceInfo(source);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Register MSME Invoice
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload an invoice or delivery challan. Google AI extracts metadata which you review before computing statutory dues.
        </p>
      </div>

      {!extractedData ? (
        <UploadCard onExtractionSuccess={handleExtraction} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800">
            <span>Document extracted successfully. Please review all fields below before saving.</span>
            <button
              onClick={() => {
                setExtractedData(null);
                setSourceInfo(null);
              }}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
            >
              Upload Different File
            </button>
          </div>
          <ReviewForm initialData={extractedData} source={sourceInfo} />
        </div>
      )}
    </div>
  );
}
