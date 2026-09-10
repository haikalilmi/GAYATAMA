import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionForUser } from "@/lib/submissions";

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sub = getSubmissionForUser(id, user.id, user.role === "ADMIN");
  if (!sub) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Submission tidak ketemu.</h1>
        <Link href="/my-missions" className="text-sm underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm text-slate-500">{sub.mission_title}</p>
        <h1 className="text-xl font-semibold">Status: {sub.status}</h1>
        <p className="text-sm text-slate-500">
          Dikirim {new Date(sub.submitted_at).toLocaleString("id-ID")} · Risiko {sub.risk_level} ({sub.risk_score})
        </p>
      </div>
      {sub.risk_flags.length > 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-4 space-y-1">
          <h2 className="font-semibold">Indikator risiko (info, bukan vonis)</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {sub.risk_flags.map((f) => (
              <li key={f.type}>
                {f.message} [{f.severity}]
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {sub.description ? (
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">Deskripsi</h2>
          <p className="text-sm text-slate-700">{sub.description}</p>
        </div>
      ) : null}
      <div className="rounded border bg-white p-4 space-y-1">
        <h2 className="font-semibold">Dampak dilaporkan</h2>
        {sub.impacts.map((m) => (
          <p key={m.name} className="text-sm text-slate-700">
            {m.name}: {m.reported_value} {m.unit}
            {m.verified_value !== null ? ` (terverifikasi: ${m.verified_value})` : ""}
          </p>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sub.evidence.map((e) => (
          <figure key={e.id} className="rounded border bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/evidence/${e.id}`} alt={e.evidence_type} className="w-full rounded" />
            <figcaption className="p-1 text-xs text-slate-500">{e.evidence_type}</figcaption>
          </figure>
        ))}
      </div>
      {sub.status === "REVISION_REQUESTED" && user.role !== "ADMIN" ? (
        <Link href={`/submissions/${sub.id}/resubmit`}
          className="inline-block rounded bg-amber-600 px-4 py-2 text-sm text-white">
          Perbaiki dan kirim ulang
        </Link>
      ) : null}
      {sub.timeline.length > 0 ? (
        <div className="rounded border bg-white p-4 space-y-1">
          <h2 className="font-semibold">Timeline</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Dikirim · {new Date(sub.submitted_at).toLocaleString("id-ID")}</li>
            {sub.timeline.map((t, i) => (
              <li key={i}>
                {t.action}{t.reason ? ` · ${t.reason}` : ""}{t.note ? ` · ${t.note}` : ""} ·{" "}
                {new Date(t.created_at).toLocaleString("id-ID")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href="/my-missions" className="text-sm underline">Kembali ke Misi Saya</Link>
    </div>
  );
}
