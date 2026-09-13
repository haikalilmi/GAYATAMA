import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { SubmitForm } from "@/app/my-missions/[id]/submit/form";
import { resubmitEvidenceAction } from "./actions";
import { ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";

export default async function ResubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sub = await sql<{
    id: string;
    user_id: string;
    status: string;
    revision_count: number;
    description: string | null;
    proof_code_input: string | null;
    partner_code_input: string | null;
    mission_id: string;
    title: string;
    requires_before_photo: boolean;
    requires_after_photo: boolean;
    requires_description: boolean;
    requires_proof_code: boolean;
    requires_partner_code: boolean;
  }>(
    `SELECT s.id, s.user_id, s.status, s.revision_count, s.description, s.proof_code_input, s.partner_code_input,
            m.id AS mission_id, m.title,
            m.requires_before_photo, m.requires_after_photo, m.requires_description,
            m.requires_proof_code, m.requires_partner_code
     FROM submissions s JOIN missions m ON m.id = s.mission_id WHERE s.id = ?`,
    id
  ).get();

  if (!sub || sub.user_id !== user.id || sub.status !== "REVISION_REQUESTED") {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 max-w-lg mx-auto shadow-rim">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">
          Tidak Dapat Melakukan Revisi
        </h1>
        <p className="text-xs text-slate-500">
          Hanya berkas berstatus permintaan revisi milikmu yang dapat dikirimkan ulang.
        </p>
        <Link
          href="/my-missions"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Misi Saya</span>
        </Link>
      </div>
    );
  }

  const metrics = (
    await sql<{ id: string; name: string; unit: string }>(
      "SELECT id, name, unit FROM mission_metrics WHERE mission_id = ? ORDER BY display_order",
      sub.mission_id
    ).all()
  ).map((m) => ({ id: m.id, name: m.name, unit: m.unit }));

  const reported = (
    await sql<{ mission_metric_id: string; reported_value: number }>(
      "SELECT mission_metric_id, reported_value FROM submission_impacts WHERE submission_id = ?",
      sub.id
    ).all()
  ).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.mission_metric_id]: r.reported_value }),
    {}
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href={`/submissions/${sub.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Detail Submission</span>
      </Link>

      {/* Briefing Banner */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 shadow-rim space-y-2">
        <div className="flex items-center gap-2 text-amber-900">
          <RotateCcw className="h-5 w-5 text-amber-700" />
          <h1 className="text-xl font-bold tracking-tight">
            Revisi Berkas: {sub.title}
          </h1>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Unggah ulang foto atau perbaiki data sesuai catatan verifikator. Kesempatan revisi hanya diberikan 1 kali sebelum keputusan akhir ditetapkan.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim">
        <SubmitForm
          idName="submission_id"
          idValue={sub.id}
          action={resubmitEvidenceAction}
          submitLabel="Kirim Revisi Berkas"
          pendingLabel="Mengunggah perbaikan..."
          requires={{
            before: !!sub.requires_before_photo,
            after: !!sub.requires_after_photo,
            description: !!sub.requires_description,
            proofCode: !!sub.requires_proof_code,
            partnerCode: !!sub.requires_partner_code,
          }}
          metrics={metrics}
          defaults={{
            description: sub.description,
            proof_code_input: sub.proof_code_input,
            partner_code_input: sub.partner_code_input,
            metrics: reported,
          }}
        />
      </div>
    </div>
  );
}
