import Link from "next/link";
import { getReviewData } from "@/lib/verification";
import { ReviewForms } from "./forms";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  AlertTriangle,
  History,
  Camera,
  CheckCircle2,
} from "lucide-react";

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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4 max-w-lg mx-auto shadow-rim">
        <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">
          Submission Tidak Ditemukan
        </h1>
        <p className="text-xs text-slate-500">
          ID submission tidak terdaftar atau sudah dibersihkan dari database.
        </p>
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Antrian</span>
        </Link>
      </div>
    );
  }

  const {
    submission,
    user,
    mission,
    participation,
    impacts,
    evidence,
    history,
    logs,
  } = data;

  const isCodeMatch =
    participation.proof_code === submission.proof_code_input;

  return (
    <div className="space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Antrian Verifikasi</span>
      </Link>

      {/* Optional Success Status Message */}
      {msg ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-2xs flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      ) : null}

      {/* Main Review Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={submission.status} />
              <span className="text-xs font-mono text-slate-400">
                ID: {submission.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {mission.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
              <span>
                Relawan: <strong className="text-slate-800">{user.full_name}</strong> ({user.email})
              </span>
              <span>·</span>
              <span className="font-mono">
                XP {user.total_xp} · {user.points_balance} PTS
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-right">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
              Riwayat Kredibilitas Akun
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">
              <span className="text-emerald-700">{history.approved} Disetujui</span> /{" "}
              <span className="text-rose-700">{history.rejected} Ditolak</span>
            </span>
          </div>
        </div>
      </div>

      {/* Split Review Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Evidence & Telemetry (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Photo Evidence Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Bukti Foto Lapangan
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {evidence.map((e) => (
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
                    <span className="text-slate-400">Tervalidasi SHA-256</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Proof Code Comparison */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 text-xs space-y-1">
              <span className="font-bold text-slate-700 block">
                Verifikasi Kode Partisipasi:
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span>
                  Kode Ditugaskan:{" "}
                  <strong className="text-slate-900">{participation.proof_code}</strong>
                </span>
                <span>·</span>
                <span>
                  Input Relawan:{" "}
                  <strong
                    className={
                      isCodeMatch ? "text-emerald-700" : "text-rose-700"
                    }
                  >
                    {submission.proof_code_input ?? "Tidak Ada"}
                  </strong>
                </span>
                {isCodeMatch ? (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    MATCH
                  </span>
                ) : (
                  <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 border border-rose-200">
                    MISMATCH
                  </span>
                )}
              </div>
            </div>

            {/* Relawan Description */}
            {submission.description ? (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Catatan Lapangan Relawan:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {submission.description}
                </p>
              </div>
            ) : null}
          </div>

          {/* Risk Scoring & Flags */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${
                    submission.risk_score > 30
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Analisis Risiko ({submission.risk_level})
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Skor: {submission.risk_score} / 100
              </span>
            </div>

            {submission.risk_flags.length === 0 ? (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Tidak ada indikator anomali atau bendera risiko terdeteksi.
                </span>
              </p>
            ) : (
              <ul className="space-y-2">
                {submission.risk_flags.map((f) => (
                  <li
                    key={f.type}
                    className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-800"
                  >
                    <span className="rounded bg-rose-200 px-1.5 py-0.2 font-mono text-[10px] font-bold text-rose-900">
                      {f.severity}
                    </span>
                    <span className="leading-relaxed">{f.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Audit Logs Trail */}
          {logs.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <History className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Jejak Audit Submission
                </h2>
              </div>
              <ul className="divide-y divide-slate-100 text-xs font-mono">
                {logs.map((l, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.action}</span>
                      {l.reason ? ` · ${l.reason}` : ""}
                      {l.note ? ` (${l.note})` : ""}
                    </div>
                    <span className="text-slate-400">
                      {new Date(l.created_at).toLocaleString("id-ID")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Right Column: Review Action Forms (5 cols) */}
        <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-8">
          <ReviewForms
            submissionId={submission.id}
            status={submission.status}
            impacts={impacts.map((m) => ({ ...m }))}
          />
        </div>
      </div>
    </div>
  );
}
