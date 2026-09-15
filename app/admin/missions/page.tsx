import Link from "next/link";
import { listAllMissions, statusActions } from "@/lib/missions";
import { StatusButtons } from "./form";
import { StatusBadge } from "@/components/ui/status-badge";
import { Target, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMissionsPage() {
  const rows = await listAllMissions();

  return (
    <div className="space-y-6 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
              <Target className="h-3 w-3" />
              Mission List
            </span>
            <span className="text-xs font-mono text-slate-400">
              {rows.length} TOTAL MISSIONS
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Manage Field Missions
          </h1>
          <p className="text-sm text-slate-500">
            Publish new missions, set target metrics, and update operational status.
          </p>
        </div>

        <Link
          href="/admin/missions/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Mission</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-rim">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Mission Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Reward</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    <Link
                      href={`/admin/missions/${m.id}`}
                      className="hover:text-sky-600 transition-colors block"
                    >
                      {m.title}
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      /{m.slug}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                      {m.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold">
                    <span className="text-sky-700">+{m.xp_reward} XP</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-amber-700">+{m.point_reward} PTS</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <StatusButtons
                      missionId={m.id}
                      actions={statusActions(m.status).map((a) => a)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
