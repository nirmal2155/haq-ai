import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-24 space-y-6">
      <div className="text-6xl font-black text-slate-200">404</div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition"
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow transition"
        >
          Supplier Dashboard
        </Link>
      </div>
    </div>
  );
}
