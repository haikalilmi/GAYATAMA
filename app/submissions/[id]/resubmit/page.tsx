import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { SubmitForm } from "@/app/my-missions/[id]/submit/form";
import { resubmitEvidenceAction } from "./actions";

export default async function ResubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sub = await sql<{
    id: string; user_id: string; status: string; revision_count: number;
    description: string | null; proof_code_input: string | null; partner_code_input: string | null;
    mission_id: string; title: string;
    requires_before_photo: boolean; requires_after_photo: boolean; requires_description: boolean;
    requires_proof_code: boolean; requires_partner_code: boolean;
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
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Tidak bisa revisi.</h1>
        <p className="text-sm text-slate-600">Hanya submission berstatus revisi milikmu yang bisa dikirim ulang.</p>
        <Link href="/my-missions" className="text-sm underline">Kembali</Link>
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
  ).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.mission_metric_id]: r.reported_value }), {});

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Revisi: {sub.title}</h1>
        <p className="text-sm text-slate-500">
          Unggah ulang foto yang diminta. Kesempatan revisi hanya sekali.
        </p>
      </div>
      <SubmitForm
        idName="submission_id"
        idValue={sub.id}
        action={resubmitEvidenceAction}
        submitLabel="Kirim revisi"
        pendingLabel="Mengunggah..."
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
  );
}
