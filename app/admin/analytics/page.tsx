import { getAnalytics } from "@/lib/analytics";
import { CategoryChart } from "./chart";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  BarChart3,
  CheckCircle2,
  Users,
  Percent,
  Inbox,
  TrendingUp,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  const pendingTotal =
    (a.statusCounts["PENDING"] ?? 0) + (a.statusCounts["UNDER_REVIEW"] ?? 0);

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
            <BarChart3 className="h-3 w-3" />
            Ringkasan Data
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Analitik & Metrik Operasi
        </h1>
        <p className="text-sm text-slate-500">
          Metrik efektivitas verifikasi, approval rate, dan capaian target misi.
        </p>
      </div>

      {/* 4 KPI Telemetry Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aksi Terverifikasi
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {a.verifiedActions.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Total aksi lolos audit</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kontributor Aktif
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {a.contributors.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Relawan terdaftar</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approval Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {a.approvalRate}%
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Rasio persetujuan berkas</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Menunggu Review
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {pendingTotal}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Pending & under review</p>
        </div>
      </div>

      {/* Grid: Category Chart & Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Distribusi Dampak per Kategori
            </h2>
          </div>
          <CategoryChart data={a.byCategory} />
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Rekap Status Seluruh Submission
            </h2>
          </div>

          {Object.keys(a.statusCounts).length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Belum ada berkas submission masuk.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {Object.entries(a.statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between py-2.5"
                >
                  <StatusBadge status={status} />
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {count.toLocaleString("id-ID")}{" "}
                    <span className="text-xs font-normal text-slate-400">berkas</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Progress Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          Progres Capaian Kampanye Strategis
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {a.campaigns.map((c) => {
            const target = c.target_value ?? 0;
            const pct = target > 0 ? Math.min(100, Math.round((c.current / target) * 100)) : 0;
            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                    {pct}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>{c.current.toLocaleString("id-ID")} kg</span>
                    <span>Target: {target.toLocaleString("id-ID")} kg</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-mono">
                  {c.participants} Partisipan · {c.actions} Aksi Lapangan
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
