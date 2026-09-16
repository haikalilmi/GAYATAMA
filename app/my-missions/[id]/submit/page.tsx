import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { SubmitForm } from "./form";
import { submitEvidenceAction } from "./actions";
import { ArrowLeft, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("/my-missions");
  const { id } = await params;
  const part = await sql<{
    id: string;
    status: string;
    proof_code: string;
    expires_at: string;
    mission_id: string;
    title: string;
    slug: string;
    requires_before_photo: boolean;
    requires_after_photo: boolean;
    requires_description: boolean;
    requires_proof_code: boolean;
    requires_partner_code: boolean;
  }>(
    `SELECT p.id, p.status, p.proof_code, p.expires_at, m.id AS mission_id, m.title, m.slug,
            m.requires_before_photo, m.requires_after_photo, m.requires_description,
            m.requires_proof_code, m.requires_partner_code
     FROM participations p JOIN missions m ON m.id = p.mission_id
     WHERE p.id = ? AND p.user_id = ?`,
    id,
    user.id
  ).get();

  if (!part) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">
          Participation Slot Not Found
        </h1>
        <p className="text-sm text-slate-500">
          The registration data is invalid or does not belong to your account.
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

  if (part.status !== "JOINED") {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 max-w-lg mx-auto">
        <ShieldCheck className="h-8 w-8 text-sky-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">
          Evidence Already Submitted ({part.status})
        </h1>
        <p className="text-sm text-slate-500">
          This mission has been sent to the verification team and is under review.
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

  const metrics = (
    await sql<{ id: string; name: string; unit: string }>(
      "SELECT id, name, unit FROM mission_metrics WHERE mission_id = ? ORDER BY display_order",
      part.mission_id
    ).all()
  ).map((m) => ({ id: m.id, name: m.name, unit: m.unit }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href="/my-missions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to My Missions</span>
      </Link>

      {/* Mission Briefing Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-rim space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
              EVIDENCE UPLOAD
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {part.title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">CODE:</span>
            <span className="rounded-md bg-sky-50 px-2.5 py-1 font-bold text-sky-800 border border-sky-200/70">
              {part.proof_code}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Submit Deadline: {new Date(part.expires_at).toLocaleString("en-US")}
          </span>
          <span className="text-slate-400">File: max 5 MB</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim">
        <SubmitForm
          idName="participation_id"
          idValue={part.id}
          action={submitEvidenceAction}
          submitLabel="Submit Evidence for Review"
          pendingLabel="Uploading evidence..."
          requires={{
            before: !!part.requires_before_photo,
            after: !!part.requires_after_photo,
            description: !!part.requires_description,
            proofCode: !!part.requires_proof_code,
            partnerCode: !!part.requires_partner_code,
          }}
          metrics={metrics}
        />
      </div>
    </div>
  );
}
