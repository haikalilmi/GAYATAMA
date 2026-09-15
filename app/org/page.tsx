import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCampaigns } from "@/lib/campaigns";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Users,
  CheckCircle2,
} from "lucide-react";

export default async function OrgDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Forg");

  if (user.role !== "ORGANIZATION" && user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 shadow-rim">
        <Building2 className="h-8 w-8 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-600">
          The organization dashboard is only for registered partner accounts (demo: org@impactquest.local).
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Main Dashboard</span>
        </Link>
      </div>
    );
  }

  const campaigns = await getCampaigns();

  return (
    <div className="space-y-8 animate-enter-tactile max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
              <Building2 className="h-3 w-3" />
              ORGANIZATION PORTAL
            </span>
            <span className="text-xs font-mono text-slate-400">
              SPONSOR PARTNER
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Organization and Initiator Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Halo, {user.full_name}. Track public engagement and your social campaign progress.
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Campaign Initiatives ({campaigns.length})
        </h2>

        {campaigns.map((c) => {
          const target = c.target_value ?? 0;
          const pct =
            target > 0 ? Math.min(100, Math.round((c.current / target) * 100)) : 0;
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4 transition-all hover:shadow-rim-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <Link
                  href={`/campaigns/${c.slug}`}
                  className="font-bold text-lg text-slate-900 hover:text-sky-600 transition-colors"
                >
                  {c.name}
                </Link>
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200/60">
                  {pct}% Achieved
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-xs text-slate-600">
                  <span>{c.current.toLocaleString("en-US")} kg collected</span>
                  <span>Target: {target.toLocaleString("en-US")} kg</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {c.participants} Participants
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {c.actions} Verified Actions
                  </span>
                </div>

                <Link
                  href={`/campaigns/${c.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  <span>Campaign Detail</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
