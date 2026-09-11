import { getAnalytics } from "@/lib/analytics";
import { CategoryChart } from "./chart";

export default async function AnalyticsPage() {
  const a = await getAnalytics();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analitik</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Aksi terverifikasi</p>
          <p className="text-2xl font-bold">{a.verifiedActions}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Kontributor</p>
          <p className="text-2xl font-bold">{a.contributors}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Approval rate</p>
          <p className="text-2xl font-bold">{a.approvalRate}%</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Menunggu review</p>
          <p className="text-2xl font-bold">
            {(a.statusCounts["PENDING"] ?? 0) + (a.statusCounts["UNDER_REVIEW"] ?? 0)}
          </p>
        </div>
      </div>

      <div className="rounded border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Dampak per kategori</h2>
        <CategoryChart data={a.byCategory} />
      </div>

      <div className="rounded border bg-white p-4 space-y-1">
        <h2 className="font-semibold">Status submission</h2>
        {Object.keys(a.statusCounts).length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada submission.</p>
        ) : (
          Object.entries(a.statusCounts).map(([s, c]) => (
            <p key={s} className="text-sm text-slate-700">{s}: {c}</p>
          ))
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Progres campaign</h2>
        {a.campaigns.map((c) => (
          <div key={c.id} className="rounded border bg-white p-4 text-sm space-y-1">
            <p className="font-medium">{c.name}</p>
            <p className="text-slate-600">
              {c.current.toLocaleString("id-ID")} / {(c.target_value ?? 0).toLocaleString("id-ID")} kg ·{" "}
              {c.participants} partisipan · {c.actions} aksi
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
