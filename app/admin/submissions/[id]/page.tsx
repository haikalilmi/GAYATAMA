import Link from "next/link";
import { getReviewData } from "@/lib/verification";
import { ReviewForms } from "./forms";

export default async function AdminReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const { msg } = await searchParams;
  const data = await getReviewData(id);
  if (!data) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Submission tidak ketemu.</h1>
        <Link href="/admin/submissions" className="text-sm underline">Kembali ke antrian</Link>
      </div>
    );
  }
  const { submission, user, mission, participation, impacts, evidence, history, logs } = data;

  return (
    <div className="space-y-6">
      <Link href="/admin/submissions" className="text-sm underline">← Antrian</Link>
      {msg ? (
        <p role="status" className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {msg}
        </p>
      ) : null}
      <div>
        <h1 className="text-xl font-semibold">{mission.title} — {user.full_name}</h1>
        <p className="text-sm text-slate-500">
          {user.email} · XP {user.total_xp} · {user.points_balance} poin · Status {submission.status}
        </p>
        <p className="text-sm text-slate-500">
          Riwayat user: {history.approved} disetujui, {history.rejected} ditolak.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded border bg-white p-4 space-y-1 text-sm">
            <h2 className="font-semibold">Bukti & laporan</h2>
            {submission.description ? <p>{submission.description}</p> : null}
            <p className="text-slate-600">
              Kode partisipasi: <span className="font-mono">{participation.proof_code}</span> ·
              input: <span className="font-mono">{submission.proof_code_input ?? "-"}</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {evidence.map((e) => (
                <figure key={e.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/evidence/${e.id}`} alt={e.evidence_type} className="w-full rounded border" />
                  <figcaption className="text-xs text-slate-500">{e.evidence_type}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="rounded border bg-white p-4 text-sm space-y-1">
            <h2 className="font-semibold">Risiko: {submission.risk_level} ({submission.risk_score})</h2>
            {submission.risk_flags.length === 0 ? (
              <p className="text-slate-500">Tanpa flag.</p>
            ) : (
              <ul className="list-disc pl-5">
                {submission.risk_flags.map((f) => (
                  <li key={f.type}>{f.message} [{f.severity}]</li>
                ))}
              </ul>
            )}
          </div>

          {logs.length > 0 ? (
            <div className="rounded border bg-white p-4 text-sm space-y-1">
              <h2 className="font-semibold">Jejak audit</h2>
              <ul className="space-y-1">
                {logs.map((l, i) => (
                  <li key={i} className="text-slate-600">
                    {l.action} · {l.reason ?? "-"} · {l.note ?? "-"} · {new Date(l.created_at).toLocaleString("id-ID")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <ReviewForms submissionId={submission.id} status={submission.status} impacts={impacts.map((m) => ({ ...m }))} />
      </div>
    </div>
  );
}
