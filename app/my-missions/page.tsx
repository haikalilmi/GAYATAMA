import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listUserParticipations } from "@/lib/participation";
import { CancelButton } from "./cancel-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Compass,
  FileCheck,
} from "lucide-react";

const tabs = [
  { key: "active", label: "Aktif", match: ["JOINED"] },
  {
    key: "review",
    label: "In Review",
    match: ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"],
  },
  { key: "attention", label: "Needs Action", match: ["REVISION_REQUESTED"] },
  {
    key: "done",
    label: "Completed",
    match: ["APPROVED", "REJECTED", "CANCELLED", "EXPIRED"],
  },
] as const;

function remaining(expiresAt: string): { label: string; urgent: boolean } {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { label: "Expired", urgent: true };
  const h = Math.floor(ms / 3600000);
  if (h < 1)
    return {
      label: `Left ${Math.max(1, Math.floor(ms / 60000))} min`,
      urgent: true,
    };
  if (h < 12) return { label: `Left ${h} h`, urgent: true };
  if (h < 48) return { label: `Left ${h} h`, urgent: false };
  return { label: `Left ${Math.floor(h / 24)} d`, urgent: false };
}

export default async function MyMissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser("/my-missions");
  const { tab } = await searchParams;
  const active = tabs.find((t) => t.key === tab) ?? tabs[0];
  const allParts = await listUserParticipations(user.id);
  const rows = allParts.filter((r) =>
    (active.match as readonly string[]).includes(r.status)
  );

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
              <CheckCircle2 className="h-3 w-3" />
              Mission History
            </span>
            <span className="text-xs font-mono text-slate-400">
              {allParts.length} TOTAL PARTICIPATIONS
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Missions
          </h1>
          <p className="text-sm text-slate-500">
            Track verification status, unique proof codes, and evidence deadlines.
          </p>
        </div>

        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Target className="h-4 w-4" />
          <span>Explore Other Missions</span>
        </Link>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200/60 max-w-fit">
        {tabs.map((t) => {
          const count = allParts.filter((r) =>
            (t.match as readonly string[]).includes(r.status)
          ).length;
          const isCurrent = t.key === active.key;
          return (
            <Link
              key={t.key}
              href={`/my-missions?tab=${t.key}`}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{t.label}</span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isCurrent
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Participations List */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Compass className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-semibold text-slate-800">
            No missions in the {active.label.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {active.key === "active"
              ? "You have not joined any mission yet."
              : "No activity history for this tab yet."}
          </p>
          <Link
            href="/missions"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <span>Open Mission Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const timeInfo = remaining(r.expires_at);
            return (
              <div
                key={r.id}
                data-mission-slug={r.mission_slug}
                data-testid="mission-card"
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-rim transition-all hover:shadow-rim-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="font-mono text-xs text-slate-400">
                        {new Date(r.joined_at).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <Link
                      href={`/missions/${r.mission_slug}`}
                      className="block text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors"
                    >
                      {r.mission_title}
                    </Link>
                  </div>

                  {/* Telemetry Block */}
                  <div className="flex sm:flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <span className="text-slate-400">KODE:</span>
                      <span className="rounded bg-sky-50 px-2 py-0.5 font-bold text-sky-800 border border-sky-200/60">
                        {r.proof_code}
                      </span>
                    </div>
                    {r.status === "JOINED" && (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono font-medium ${
                          timeInfo.urgent
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {timeInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-500 font-mono">
                    Deadline: {new Date(r.expires_at).toLocaleString("en-US")}
                  </p>

                  <div className="flex items-center gap-2">
                    {r.submission_id ? (
                      <Link
                        href={`/submissions/${r.submission_id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        <FileCheck className="h-3.5 w-3.5 text-sky-600" />
                        <span>Submission Detail</span>
                      </Link>
                    ) : null}

                    {r.status === "JOINED" ? (
                      <>
                        <CancelButton participationId={r.id} />
                        <Link
                          href={`/my-missions/${r.id}/submit`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          <span>Submit Evidence</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
