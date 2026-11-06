'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { NoticePreview } from '@/components/NoticePreview';

export default function NoticePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{
    finalBody: string;
    summaryLocal: string;
    lang: string;
    fallbackUsed: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNotice = React.useCallback(async (selectedLang: 'en' | 'hi' | 'gu') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-supplier_demo',
        },
        body: JSON.stringify({
          invoiceId,
          lang: selectedLang,
          supplierName: 'ABC Precision Engineering Pvt Ltd',
          supplierUdyam: 'UDYAM-GJ-01-0012345',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate notice');
      }

      setNotice({
        finalBody: data.finalBody,
        summaryLocal: data.summaryLocal,
        lang: selectedLang,
        fallbackUsed: data.fallbackUsed,
      });
      setLang(selectedLang);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating notice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchNotice('en');
    }
  }, [invoiceId, fetchNotice]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Link
          href={`/invoices/${invoiceId}/samadhaan`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <span>Open MSME Samadhaan Filing Kit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading && !notice && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            Drafting statutory notice with MSMED Section 15 & 16 interest...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <NoticePreview
          invoiceId={invoiceId}
          initialNotice={notice}
          onLanguageChange={(newLang) => fetchNotice(newLang)}
          isLoading={loading}
        />
      )}
    </div>
  );
}
