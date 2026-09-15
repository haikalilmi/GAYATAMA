export default function Loading() {
  return (
    <div className="space-y-8 animate-enter-tactile" role="status" aria-label="Loading">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200/70" />
        <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-28 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200/70" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
