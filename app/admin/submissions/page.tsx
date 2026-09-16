import Link from "next/link";
import {
  listMissionsForFilter,
  listSubmissions,
  parseQueueFilter,
} from "@/lib/admin";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Search,
  SlidersHorizontal,
  Inbox,
  ArrowRight,
} from "lucide-react";

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "flagged", label: "High Risk" },
  { key: "revision", label: "Revision" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

export default async function SubmissionQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = parseQueueFilter(sp);
  const rows = await listSubmissions(filter);
  const missions = await listMissionsForFilter();
  const tab = filter.tab ?? "pending";

  return (
    <div className="space-y-6 animate-enter-tactile">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Submission Review Queue
          </h1>
          <p className="text-sm text-slate-500">
            Audit field evidence photos, validate metric values, and approve rewards.
          </p>
        </div>
      </div>

      {/* Segmented Tab Filter */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5 border border-slate-200/70 max-w-fit">
        {tabs.map((t) => {
          const isCurrent = tab === t.key;
          return (
            <Link
              key={t.key}
              href={{
                pathname: "/admin/submissions",
                query: { ...sp, tab: t.key },
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-rim">
        <form method="get" className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="tab" value={tab} />

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={filter.q ?? ""}
              placeholder="Search volunteer name or mission title..."
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          {/* Mission Dropdown */}
          <div className="w-48">
            <select
              id="mission"
              name="mission"
              defaultValue={filter.mission ?? "ALL"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            >
              <option value="ALL">All Missions</option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Dropdown */}
          <div className="w-36">
            <select
              id="risk"
              name="risk"
              defaultValue={filter.risk ?? "ALL"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Data Table */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <Inbox className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="mt-3 text-base font-semibold text-slate-800">
            No submissions found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Change the status tab or search keyword above.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-rim">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Field Mission</th>
                  <th className="px-5 py-3.5">Volunteer Name</th>
                  <th className="px-5 py-3.5">Audit Status</th>
                  <th className="px-5 py-3.5">Risk Score</th>
                  <th className="px-5 py-3.5">Submitted At</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <Link
                        href={`/admin/submissions/${r.id}`}
                        className="hover:text-sky-600 transition-colors"
                      >
                        {r.mission_title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {r.user_name}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          r.risk_score > 30
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {r.risk_level} ({r.risk_score})
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {new Date(r.submitted_at).toLocaleString("en-US")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/submissions/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <span>Audit</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
