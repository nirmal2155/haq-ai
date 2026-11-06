import Link from 'next/link';
import { Scale, TrendingUp, Shield, FileText, Mic, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero */}
      <section className="text-center space-y-8 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          MSMED Act 2006 · Section 15, 16 · Income Tax Section 43B(h)
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Your statutory right<br />
          <span className="text-emerald-600">to get paid.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Haq AI helps Indian micro &amp; small suppliers calculate compound interest on overdue
          payments, draft legal notices, and file MSME Samadhaan claims — without touching a
          spreadsheet.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-base"
          >
            Upload Invoice
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow transition-all text-base"
          >
            Supplier Dashboard
          </Link>
          <Link
            href="/buyer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow transition-all text-base"
          >
            Buyer 43B(h) Risk
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs text-slate-500 font-medium">
          <span>✓ No AI touches legal math</span>
          <span>✓ Paise-level deterministic engine</span>
          <span>✓ Decimal.js — zero floating-point errors</span>
          <span>✓ MSMED Act Sections 15 &amp; 16</span>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How Haq AI Works</h2>
          <p className="text-sm text-slate-500 mt-2">From invoice to enforcement in four steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { step: '01', title: 'Upload Invoice', desc: 'PDF or image — Gemini AI extracts fields. You review and correct before saving.', color: 'emerald' },
            { step: '02', title: 'Engine Calculates', desc: 'Deterministic code computes due dates and 3× compound interest to the paise.', color: 'blue' },
            { step: '03', title: 'Draft Legal Notice', desc: 'Template-filled notice in EN/HI/GU. LLM only translates tone — never touches numbers.', color: 'violet' },
            { step: '04', title: 'File Samadhaan Kit', desc: 'Field-by-field copy kit for MSME Samadhaan portal. No auto-submission ever.', color: 'amber' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className={`w-10 h-10 bg-${color}-100 text-${color}-700 rounded-lg flex items-center justify-center font-black text-sm`}>
                {step}
              </div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Scale className="w-8 h-8 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">15 / 45-Day Rule</h2>
          <p className="text-sm text-slate-600">
            Payments mandated within 15 days (no agreement) or up to 45 days (written agreement).
            Deemed acceptance dates calculated mathematically from MSMED Section 2(b).
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">3× RBI Compound Interest</h2>
          <p className="text-sm text-slate-600">
            Section 16 interest at 3× bank rate, compounded with monthly rests.
            Decimal.js engine — never floating point. CA-auditable output.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Shield className="w-8 h-8 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Section 43B(h) Exposure</h2>
          <p className="text-sm text-slate-600">
            Corporate buyers cannot deduct unpaid MSME dues from taxable income beyond statutory
            limits. Haq AI shows buyers their exact disallowance risk.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <FileText className="w-8 h-8 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-900">AI-Drafted Legal Notices</h2>
          <p className="text-sm text-slate-600">
            Statutory notice template filled by code. Gemini translates tone in Hindi and Gujarati.
            Numbers, dates, and party names are locked — LLM cannot change them.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Mic className="w-8 h-8 text-pink-600" />
          <h2 className="text-lg font-bold text-slate-900">Voice Settlement Calls</h2>
          <p className="text-sm text-slate-600">
            Gemini Live voice session simulates buyer-supplier negotiation.
            Ephemeral tokens — API key never reaches the browser.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-xl shadow-sm space-y-3 text-white">
          <div className="text-4xl font-black">46</div>
          <h2 className="text-lg font-bold">Unit Tests Passing</h2>
          <p className="text-sm text-emerald-100">
            Engine tests cover leap years, month ends, zero days overdue, and CA-verified golden
            arithmetic. Run <code className="bg-emerald-900 px-1 rounded">npm test</code> anytime.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
        <p className="text-xs text-amber-800 font-medium">
          <strong>Legal Disclaimer:</strong> Haq AI is a drafting and decision-support tool, not legal advice.
          Verify all statutory parameters with a CA or lawyer. No data is submitted to any government portal automatically.
        </p>
      </section>
    </div>
  );
}
