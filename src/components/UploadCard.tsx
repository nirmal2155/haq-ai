'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

interface UploadCardProps {
  onExtractionSuccess: (extractedData: any, source: any) => void;
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Upload MSME Invoice / Delivery Challan</h3>
          <p className="text-xs text-slate-500">Supports PDF, JPEG, PNG, WEBP (Max 8 MB)</p>
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-8 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/20"
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
            <FileText className="w-8 h-8 text-emerald-600" />
            <span className="text-sm font-medium text-slate-800">{selectedFile.name}</span>
            <span className="text-xs text-slate-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-600 font-medium">Click to browse or drag and drop invoice</p>
            <p className="text-xs text-slate-400">Strict magic-bytes validated server-side</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
        >
          {isUploading ? (
            <>Processing Document with Google AI...</>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Analyze & Extract Invoice Fields
            </>
          )}
        </button>
      )}
    </div>
  );
}
