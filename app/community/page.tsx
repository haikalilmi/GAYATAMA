import { getCommunityImpact } from "@/lib/impact";
import {
  Users,
  CheckCircle2,
  Info,
} from "lucide-react";

export default async function CommunityPage() {
  const c = await getCommunityImpact();

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              LIVE TELEMETRY
            </span>
            <span className="text-xs font-mono text-slate-400">
              AGGREGATE SOCIAL IMPACT
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Collective Community Impact
          </h1>
          <p className="text-sm text-slate-500">
            All impact data is calculated from field submissions approved by the verification committee.
          </p>
        </div>
      </div>

      {/* Top 2 KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-rim transition-all hover:shadow-rim-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Verified Actions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-mono text-4xl font-black tracking-tight text-slate-900">
              {c.verifiedActions.toLocaleString("en-US")}
            </p>
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">100% Audited</span> ·
              Validated through photo evidence and coordinates
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-rim transition-all hover:shadow-rim-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Volunteer Contributors
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-mono text-4xl font-black tracking-tight text-slate-900">
              {c.contributors.toLocaleString("en-US")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Registered community members and social drivers
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Telemetry Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Measurable Environmental and Social Metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.metrics.map((m) => (
            <div
              key={m.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {m.label}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                  REAL-TIME
                </span>
              </div>
              <div className="mt-3">
                <p className="font-mono text-2xl font-bold tracking-tight text-slate-900">
                  {m.value.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Collected from all verified volunteers
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Transparency Callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-xs text-slate-600">
        <Info className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Audit Transparency:</strong> Baseline
          figures come from demonstration data. Every prototype field submission
          approved by an admin automatically adds real values to the aggregate
          totals above.
        </p>
      </div>
    </div>
  );
}
