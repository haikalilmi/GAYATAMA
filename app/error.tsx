"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Ada yang gagal dimuat.</h2>
      <p className="text-sm text-slate-600">{error.message}</p>
      <button
        onClick={reset}
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}
