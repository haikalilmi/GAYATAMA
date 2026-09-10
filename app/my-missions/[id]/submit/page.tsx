import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { SubmitForm } from "./form";
import { submitEvidenceAction } from "./actions";

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/my-missions");
  const { id } = await params;
  const db = getDb();
  const part = db
    .prepare(
      `SELECT p.id, p.status, p.proof_code, p.expires_at, m.id AS mission_id, m.title, m.slug,
              m.requires_before_photo, m.requires_after_photo, m.requires_description,
              m.requires_proof_code, m.requires_partner_code
       FROM participations p JOIN missions m ON m.id = p.mission_id
       WHERE p.id = ? AND p.user_id = ?`
    )
    .get(id, user.id) as
    | {
        id: string; status: string; proof_code: string; expires_at: string;
        mission_id: string; title: string; slug: string;
        requires_before_photo: number; requires_after_photo: number; requires_description: number;
        requires_proof_code: number; requires_partner_code: number;
      }
    | undefined;

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
    db
      .prepare("SELECT id, name, unit FROM mission_metrics WHERE mission_id = ? ORDER BY display_order")
      .all(part.mission_id) as unknown as { id: string; name: string; unit: string }[]
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
          before: part.requires_before_photo === 1,
          after: part.requires_after_photo === 1,
          description: part.requires_description === 1,
          proofCode: part.requires_proof_code === 1,
          partnerCode: part.requires_partner_code === 1,
        }}
        metrics={metrics}
      />
    </div>
  );
}
