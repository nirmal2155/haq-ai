export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-28 bg-slate-100 rounded-xl" />
        <div className="h-28 bg-slate-100 rounded-xl" />
        <div className="h-28 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-64 bg-slate-100 rounded-xl" />
    </div>
  );
}
