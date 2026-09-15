import Link from "next/link";
import { getAdminStats } from "@/lib/admin";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Inbox,
  AlertTriangle,
  Target,
  CheckCircle2,
  ArrowRight,
  History,
} from "lucide-react";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* 4 KPI Telemetry Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/submissions?tab=pending"
          className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Awaiting Review
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {stats.pending}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Needs verification action</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </p>
        </Link>

        <Link
          href="/admin/submissions?tab=flagged"
          className="rounded-2xl border border-rose-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              High Risk
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {stats.highRisk}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Fraud flag detections</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </p>
        </Link>

        <Link
          href="/admin/missions"
          className="rounded-2xl border border-sky-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Active Missions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {stats.activeMissions}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Open for volunteers to join</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </p>
        </Link>

        <Link
          href="/admin/submissions?tab=approved"
          className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Approved Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight text-slate-900">
            {stats.verifiedToday}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Passed verifier audit</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </p>
        </Link>
      </div>

      {/* Priority Review Queue Preview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Priority Review Queue
            </h2>
            <p className="text-xs text-slate-500">
              Latest submissions that need evidence review
            </p>
          </div>
          <Link
            href="/admin/submissions"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            View Full Queue
          </Link>
        </div>

        {stats.queuePreview.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            The review queue is clear. No pending files.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.queuePreview.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/submissions/${r.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                    >
                      {r.mission_title}
                    </Link>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Submitted by: <span className="font-semibold text-slate-700">{r.user_name}</span> · Risk Indicator:{" "}
                    <span
                      className={`font-mono font-bold ${
                        r.risk_score > 30 ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {r.risk_level} ({r.risk_score})
                    </span>
                  </p>
                </div>

                <Link
                  href={`/admin/submissions/${r.id}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
                >
                  <span>Start Review</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Verification Activity Stream */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Recent Verification Audit Trail
          </h2>
        </div>

        {stats.recentActivity.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No new verification audit entries.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {stats.recentActivity.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/60">
                    {a.action}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {a.mission_title}
                  </span>
                  <span className="text-slate-400">({a.user_name})</span>
                </div>
                <span className="font-mono text-slate-400">
                  {new Date(a.created_at).toLocaleString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
