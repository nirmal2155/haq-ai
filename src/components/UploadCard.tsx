'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

import { ExtractedInvoiceFormInput, ExtractedInvoiceSource } from './ReviewForm';

interface UploadCardProps {
  onExtractionSuccess: (extractedData: ExtractedInvoiceFormInput, source?: ExtractedInvoiceSource) => void;
}

export function UploadCard({ onExtractionSuccess }: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getAuthHeader } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 8 MB check
      if (file.size > 8 * 1024 * 1024) {
        setError('File exceeds maximum size of 8 MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // In client mode, attach real Firebase ID token or demo fallback
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: await getAuthHeader(),
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract document');
      }

      onExtractionSuccess(data.extracted, data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Upload MSME Invoice or Delivery Challan</h3>
          <p className="text-xs text-slate-400 font-mono">Supports PDF, JPEG, PNG, WEBP (Max 8 MB, verified by magic-bytes)</p>
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/60 hover:bg-slate-900/40"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white">{selectedFile.name}</span>
            <span className="text-xs font-mono text-slate-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Click to select document or drag &amp; drop</p>
            <p className="text-xs font-mono text-slate-500">Magic-bytes inspected &amp; encrypted in private cloud storage</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-300 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider min-h-[44px]"
        >
          {isUploading ? (
            <>Processing Document with Google Gemini Multimodal...</>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Analyze &amp; Extract Invoice Fields
            </>
          )}
        </button>
      )}
    </div>
  );
}
