import Link from 'next/link';
import {
  Sparkles,
  Scale,
  TrendingUp,
  Shield,
  FileText,
  Mic,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
} from 'lucide-react';
import { StudioPlayground } from '@/components/StudioPlayground';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8">
        {/* Google AI Studio Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono shadow-inner shadow-white/5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Statutory Rights &amp; Recovery Copilot</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-emerald-400 font-semibold">MSMED Act 2006</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
          Your statutory right<br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            to get paid on time.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
          Haq AI empowers Indian micro &amp; small enterprises to enforce mandatory 15/45-day payment deadlines, calculate <strong className="text-slate-200">3× RBI compound interest</strong> to the paise, and alert corporate buyers of <strong className="text-slate-200">Section 43B(h)</strong> tax disallowance.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm min-h-[44px]"
          >
            <span>Upload Invoice (OCR Vision)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-sm min-h-[44px]"
          >
            <span>Supplier Dashboard</span>
          </Link>

          <Link
            href="/buyer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-xl border border-amber-500/30 transition-all text-sm min-h-[44px]"
          >
            <span>Buyer 43B(h) Risk</span>
          </Link>
        </div>

        {/* Architecture Specs Chip Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero-Math AI (Decimal.js)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Human-in-the-Loop Approval
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multiset Token Parity (HI/GU)
          </span>
        </div>
      </section>

      {/* Interactive Studio Engine Playground */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Interactive Statutory Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Test live Section 15 deadlines and Section 16 compound interest without uploading any files.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 hidden sm:inline">
            Deterministic Engine: Verified
          </span>
        </div>

        <StudioPlayground />
      </section>

      {/* Bento Grid: Core Studio Capabilities */}
      <section className="space-y-6 max-w-6xl mx-auto pt-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Designed for Enterprise Precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A hardened architecture that combines Google AI Vision with zero-math legal computation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Zero-Math Engine */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Math Deterministic Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Large language models never compute legal dates, principal balances, or interest. All arithmetic runs in pure TypeScript using <strong className="text-slate-200">Decimal.js</strong> to the integer paise.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
              <span>Section 15 &amp; 16 Pure Math</span>
              <span className="text-slate-500">100% Branch Tested</span>
            </div>
          </div>

          {/* Bento Card 2: Section 43B(h) Corporate Tax Timing */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Section 43B(h) Tax Disallowance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Corporate buyers cannot claim tax deductions on unpaid MSME invoices outstanding past statutory limits at year-end. Haq AI alerts buyer CFOs to unlock delayed receivables amicably.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-amber-400 flex items-center justify-between">
              <span>Income Tax Act s.43B(h)</span>
              <span className="text-slate-500">31st March Deadlines</span>
            </div>
          </div>

          {/* Bento Card 3: Human in the loop */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human-in-the-Loop Guarantee</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nothing is ever transmitted to a third party or government portal automatically. Reminders land in an approval queue where the MSME owner has complete control with a single tap.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
              <span>One-Tap Dispatch Queue</span>
              <span className="text-slate-500">100% User Approved</span>
            </div>
          </div>

          {/* Bento Card 4: Multimodal OCR Vision */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multimodal Invoice Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload tax invoices, challans, or lorry receipts in PDF or image formats. Powered by Gemini with structured JSON schemas and automatic flagging of missing acceptance dates.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-indigo-400 flex items-center justify-between">
              <span>Gemini 2.5 Flash Vision</span>
              <span className="text-slate-500">Magic-Byte Protected</span>
            </div>
          </div>

          {/* Bento Card 5: Samadhaan Copy Kit */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">MSME Samadhaan Filing Kit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Field-by-field copy toolkit mapped directly to the government portal (`samadhaan.msme.gov.in`), alongside certified HTML/PDF evidence packs with interest ledgers.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-purple-400 flex items-center justify-between">
              <span>Council Dossier Generator</span>
              <span className="text-slate-500">Official Portal Mapped</span>
            </div>
          </div>

          {/* Bento Card 6: DPDP Act Privacy */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">DPDP Act 2023 &amp; Zero-PII</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero GSTIN, PAN, or amounts logged in plaintext. 5-minute signed URLs, ephemeral tokens for voice sessions, and one-click atomic right to erasure (`DELETE /api/user/data`).
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-pink-400 flex items-center justify-between">
              <span>Section 12 Right to Erasure</span>
              <span className="text-slate-500">Zero-Trust Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Statutory Notice Section */}
      <section className="max-w-4xl mx-auto p-5 rounded-2xl bg-slate-950 border border-amber-500/25 text-center space-y-2">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
          Statutory Legal Notice &amp; Compliance Guardrail
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Draft only. Review with a CA/lawyer before sending.</strong> Haq AI is a drafting, interest calculation, and evidence compilation system. It does not provide legal representation, legal advice, or automated government portal scraping.
        </p>
      </section>
    </div>
  );
}
