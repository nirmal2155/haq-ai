import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          <span>MSMED Act 2006</span>
          <span>•</span>
          <span>Income Tax Sec 43B(h)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Get Paid on Time. <br className="hidden sm:inline" />
          <span className="text-emerald-600">Claim 3× Compound Interest.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Haq AI empowers Indian Micro and Small Suppliers to recover overdue dues from corporate buyers.
          Deterministic statutory interest calculations, one-click legal notice generation, MSME Samadhaan kit,
          and voice settlement support.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/invoices/new"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all text-center"
          >
            Upload Invoice & Extract
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow transition-all text-center"
          >
            View Supplier Dashboard
          </Link>
          <Link
            href="/buyer"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow transition-all text-center"
          >
            Check Buyer 43B(h) Risk
          </Link>
        </div>
      </section>

      {/* 3 Pillars / Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-lg">
            15d
          </div>
          <h2 className="text-lg font-bold text-slate-900">15 / 45-Day Statutory Rule</h2>
          <p className="text-sm text-slate-600">
            Payment is mandated within 15 days without an agreement, or up to 45 days if mutually agreed in writing.
            Deemed acceptance dates calculated mathematically.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-lg">
            3×
          </div>
          <h2 className="text-lg font-bold text-slate-900">3× RBI Bank Rate Interest</h2>
          <p className="text-sm text-slate-600">
            Compounded with monthly rests under Section 16 of MSMED Act.
            Exact paise-level deterministic engine with zero floating point errors.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-lg">
            43B
          </div>
          <h2 className="text-lg font-bold text-slate-900">Section 43B(h) Exposure</h2>
          <p className="text-sm text-slate-600">
            Corporate buyers cannot claim tax deductions for unpaid MSME invoices delayed past statutory limits.
            Gives real leverage to get paid promptly.
          </p>
        </div>
      </section>
    </div>
  );
}
