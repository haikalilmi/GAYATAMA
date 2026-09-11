import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { SubmitForm } from "./form";
import { submitEvidenceAction } from "./actions";

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/my-missions");
  const { id } = await params;
  const part = await sql<{
    id: string; status: string; proof_code: string; expires_at: string;
    mission_id: string; title: string; slug: string;
    requires_before_photo: boolean; requires_after_photo: boolean; requires_description: boolean;
    requires_proof_code: boolean; requires_partner_code: boolean;
  }>(
    `SELECT p.id, p.status, p.proof_code, p.expires_at, m.id AS mission_id, m.title, m.slug,
            m.requires_before_photo, m.requires_after_photo, m.requires_description,
            m.requires_proof_code, m.requires_partner_code
     FROM participations p JOIN missions m ON m.id = p.mission_id
     WHERE p.id = ? AND p.user_id = ?`,
    id, user.id
  ).get();

  if (!part) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Partisipasi tidak ketemu.</h1>
        <Link href="/my-missions" className="text-sm underline">Kembali</Link>
      </div>
    );
  }
  if (part.status !== "JOINED") {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Sudah disubmit ({part.status}).</h1>
        <Link href="/my-missions" className="text-sm underline">Kembali</Link>
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
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Submit bukti: {part.title}</h1>
        <p className="text-sm text-slate-500">
          Batas: {new Date(part.expires_at).toLocaleString("id-ID")}. Foto JPG/PNG/WEBP maks 5 MB.
        </p>
      </div>
      <SubmitForm
        idName="participation_id"
        idValue={part.id}
        action={submitEvidenceAction}
        submitLabel="Kirim bukti"
        pendingLabel="Mengunggah..."
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
  );
}
