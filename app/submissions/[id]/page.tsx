import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionForUser } from "@/lib/submissions";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Camera,
  Layers,
  History,
} from "lucide-react";

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
          Berkas Submission Tidak Ditemukan
        </h1>
        <p className="text-xs text-slate-500">
          Berkas mungkin telah dihapus atau kamu tidak memiliki akses.
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href="/my-missions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Misi Saya</span>
      </Link>

      {/* Main Status Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-rim space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              STATUS AUDIT DOKUMENTASI · Status: {sub.status}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {sub.mission_title}
            </h1>
          </div>
          <StatusBadge status={sub.status} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <span>
            Dikirim pada: {new Date(sub.submitted_at).toLocaleString("id-ID")}
          </span>
          <span
            className={`rounded px-2 py-0.5 font-bold ${
              sub.risk_score > 30
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Tingkat Risiko: {sub.risk_level} ({sub.risk_score}/100)
          </span>
        </div>
      </div>

      {/* Revision Notice Banner */}
      {sub.status === "REVISION_REQUESTED" && user.role !== "ADMIN" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-6 shadow-rim space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <RotateCcw className="h-5 w-5 text-amber-700" />
            <h2 className="font-bold text-base">Permintaan Revisi dari Verifikator</h2>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Tim verifikasi meminta perbaikan foto dokumentasi atau klarifikasi sebelum reward XP dan poin dapat dicairkan. Kamu memiliki 1 kali kesempatan untuk mengunggah ulang bukti.
          </p>
          <Link
            href={`/submissions/${sub.id}/resubmit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition-all"
          >
            <span>Perbaiki dan kirim ulang bukti</span>
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>
      )}

      {/* Risk Flags if present */}
      {sub.risk_flags.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
            Indikator Deteksi Otomatis:
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
            Angka Dampak Lapangan
          </h2>
        </div>

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
                  ✓ Terverifikasi: {m.verified_value} {m.unit}
                </p>
              ) : (
                <p className="text-[11px] font-mono text-slate-400">
                  Menunggu penetapan verifikator
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
            Catatan Lapangan & Deskripsi:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            {sub.description}
          </p>
        </div>
      ) : null}

      {/* Photo Gallery */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Camera className="h-4 w-4 text-sky-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Dokumentasi Bukti yang Diunggah
          </h2>
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
                alt={e.evidence_type}
                className="w-full h-48 object-cover rounded-lg border border-slate-200"
              />
              <figcaption className="mt-2 px-1 text-[11px] font-mono font-semibold uppercase text-slate-600 flex items-center justify-between">
                <span>{e.evidence_type}</span>
                <span className="text-emerald-700">Tersimpan</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Audit Timeline */}
      {sub.timeline.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <History className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Jejak Riwayat Verifikasi
            </h2>
          </div>

          <ul className="divide-y divide-slate-100 text-xs font-mono">
            <li className="py-2 flex items-center justify-between text-slate-600">
              <span>Berkas Dikirimkan Awal</span>
              <span>{new Date(sub.submitted_at).toLocaleString("id-ID")}</span>
            </li>
            {sub.timeline.map((t, i) => (
              <li key={i} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{t.action}</span>
                  {t.reason ? ` · ${t.reason}` : ""}
                  {t.note ? ` (${t.note})` : ""}
                </div>
                <span className="text-slate-400">
                  {new Date(t.created_at).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
