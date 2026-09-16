import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionForUser } from "@/lib/submissions";
import { EVIDENCE_LABELS } from "@/lib/evidence";
import { StatusBadge } from "@/components/ui/status-badge";
import { NextSteps } from "@/components/ui/next-steps";
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Camera,
  Layers,
  History,
} from "lucide-react";

// Plain-language meaning of each status, shown to the contributor.
const STATUS_MEANING: Record<string, string> = {
  PENDING: "We received your proof. It is waiting in line for a reviewer to open it.",
  UNDER_REVIEW: "A reviewer is looking at your photos and numbers right now.",
  RESUBMITTED: "We received your updated proof. A reviewer will look at it again.",
  REVISION_REQUESTED: "A reviewer needs one fix from you before this can be approved.",
  APPROVED: "Well done. Your proof was accepted and the reward has been added to your account.",
  REJECTED: "This proof was not accepted. Open the review history below to see why.",
};

const AWAITING_REVIEW = ["PENDING", "UNDER_REVIEW", "RESUBMITTED"];

// Reviewer actions in plain words.
const ACTION_LABEL: Record<string, string> = {
  START_REVIEW: "A reviewer opened your proof",
  APPROVE: "A reviewer approved your proof",
  REJECT: "A reviewer rejected your proof",
  REQUEST_REVISION: "A reviewer asked you to fix something",
};

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sub = await getSubmissionForUser(id, user.id, user.role === "ADMIN");

  if (!sub) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 max-w-lg mx-auto shadow-rim">
        <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">
          Submission Not Found
        </h1>
        <p className="text-xs text-slate-500">
          The file may have been deleted or you do not have access.
        </p>
        <Link
          href="/my-missions"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to My Missions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href="/my-missions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to My Missions</span>
      </Link>

      {/* Main Status Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-rim space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Your proof
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {sub.mission_title}
            </h1>
          </div>
          <StatusBadge status={sub.status} />
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {STATUS_MEANING[sub.status] ?? "We received your proof and are processing it."}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <span>
            Sent on: {new Date(sub.submitted_at).toLocaleString("en-US")}
          </span>
          {user.role === "ADMIN" ? (
            <span
              className={`rounded px-2 py-0.5 font-bold ${
                sub.risk_score > 30
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Risk Level: {sub.risk_level} ({sub.risk_score}/100)
            </span>
          ) : null}
        </div>
      </div>

      {/* What happens next — only while the review is still running */}
      {AWAITING_REVIEW.includes(sub.status) && user.role !== "ADMIN" ? <NextSteps /> : null}

      {/* Revision Notice Banner */}
      {sub.status === "REVISION_REQUESTED" && user.role !== "ADMIN" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-6 shadow-rim space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <RotateCcw className="h-5 w-5 text-amber-700" />
            <h2 className="font-bold text-base">Revision Requested by Reviewer</h2>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            The verification team needs better documentation photos or clarification before XP and points can be released. You have one chance to re-upload your evidence.
          </p>
          <Link
            href={`/submissions/${sub.id}/resubmit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition-all"
          >
            <span>Fix and resubmit evidence</span>
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>
      )}

      {/* Risk Flags if present */}
      {sub.risk_flags.length > 0 && user.role === "ADMIN" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
            Automatic Detection Flags:
          </span>
          <ul className="space-y-1.5 text-xs text-amber-800">
            {sub.risk_flags.map((f) => (
              <li key={f.type} className="flex items-center gap-2">
                <span className="rounded bg-amber-200 px-1 py-0.2 font-mono text-[10px] font-bold">
                  {f.severity}
                </span>
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Impact Metrics Reported vs Verified */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            What you reported
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          These are the numbers you entered. A reviewer confirms them before they count toward the public totals.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {sub.impacts.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-slate-200/70 bg-slate-50 p-3.5 space-y-1"
            >
              <span className="text-xs font-semibold text-slate-600">
                {m.name}
              </span>
              <p className="font-mono text-base font-bold text-slate-900">
                {m.reported_value} {m.unit}
              </p>
              {m.verified_value !== null ? (
                <p className="text-[11px] font-mono text-emerald-700 font-semibold">
                  ✓ Verified: {m.verified_value} {m.unit}
                </p>
              ) : (
                <p className="text-[11px] font-mono text-slate-400">
                  Awaiting verifier confirmation
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {sub.description ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Field Notes and Description:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            {sub.description}
          </p>
        </div>
      ) : null}

      {/* Photo Gallery */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Your photos
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Only you and the reviewer can open these. Nobody else can see them.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sub.evidence.map((e) => (
            <figure
              key={e.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/evidence/${e.id}`}
                alt={EVIDENCE_LABELS[e.evidence_type] ?? e.evidence_type}
                className="w-full h-48 object-cover rounded-lg border border-slate-200"
              />
              <figcaption className="mt-2 px-1 text-[11px] font-mono font-semibold uppercase text-slate-600 flex items-center justify-between">
                <span>{EVIDENCE_LABELS[e.evidence_type] ?? e.evidence_type}</span>
                <span className="text-emerald-700">Stored</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Audit Timeline */}
      {sub.timeline.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Review history
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Who looked at your proof, and what they decided.
            </p>
          </div>

          <ul className="divide-y divide-slate-100 text-xs font-mono">
            <li className="py-2 flex items-center justify-between text-slate-600">
              <span>You sent your proof</span>
              <span>{new Date(sub.submitted_at).toLocaleString("en-US")}</span>
            </li>
            {sub.timeline.map((t, i) => (
              <li key={i} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">
                    {ACTION_LABEL[t.action] ?? t.action}
                  </span>
                  {t.reason ? ` · ${t.reason}` : ""}
                  {t.note ? ` (${t.note})` : ""}
                </div>
                <span className="text-slate-400">
                  {new Date(t.created_at).toLocaleString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
