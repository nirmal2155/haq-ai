'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { VoiceCall } from '@/components/VoiceCall';
import { useAuth } from '@/lib/useAuth';

export default function VoiceCallPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { getAuthHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<{
    token: string;
    context: {
      buyerName: string;
      invoiceNo: string;
      amount: string;
      dueDate: string;
      daysOverdue: number;
      interest: string;
      total: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveToken() {
      try {
        setLoading(true);
        const res = await fetch('/api/live/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeader()),
          },
          body: JSON.stringify({
            invoiceId,
            supplierName: 'ABC Precision Engineering Pvt Ltd',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to acquire live ephemeral token');
        }

        setTokenData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error starting voice session');
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId) {
      fetchLiveToken();
    }
  }, [invoiceId, getAuthHeader]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            Requesting server-locked ephemeral token for Gemini Live...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {tokenData && (
        <VoiceCall
          invoiceId={invoiceId}
          context={tokenData.context}
        />
      )}
    </div>
  );
}
