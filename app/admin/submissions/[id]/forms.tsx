"use client";

import { useActionState } from "react";
import {
  approveAction,
  rejectAction,
  revisionAction,
  startReviewAction,
  type ReviewState,
} from "./actions";
import { REJECTION_REASONS } from "@/lib/review-constants";
import { Check, RotateCcw, X, Play, Loader2 } from "lucide-react";

function Msg({ state }: { state: ReviewState | null }) {
  if (!state) return null;
  if (state.error)
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 shadow-2xs"
      >
        {state.error}
      </div>
    );
  if (state.ok)
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 shadow-2xs"
      >
        {state.ok}
      </div>
    );
  return null;
}

export function ReviewForms({
  submissionId,
  status,
  impacts,
}: {
  submissionId: string;
  status: string;
  impacts: {
    metric_id: string;
    name: string;
    unit: string;
    reported_value: number;
    verified_value: number | null;
  }[];
}) {
  const [startState, startForm, startPending] = useActionState<
    ReviewState | null,
    FormData
  >(startReviewAction, null);
  const [apprState, apprForm, apprPending] = useActionState<
    ReviewState | null,
    FormData
  >(approveAction, null);
  const [rejState, rejForm, rejPending] = useActionState<
    ReviewState | null,
    FormData
  >(rejectAction, null);
  const [revState, revForm, revPending] = useActionState<
    ReviewState | null,
    FormData
  >(revisionAction, null);

  const reviewable = status === "PENDING" || status === "UNDER_REVIEW";

  return (
    <div className="space-y-5">
      {status === "PENDING" ? (
        <form
          action={startForm}
          className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-rim space-y-3"
        >
          <input type="hidden" name="submission_id" value={submissionId} />
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Mulai Audit Berkas
            </h3>
            <p className="text-xs text-slate-600">
              Kunci submission ini ke status &quot;Sedang Ditinjau&quot; agar tidak ditangani ganda.
            </p>
          </div>
          <Msg state={startState} />
          <button
            type="submit"
            disabled={startPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {startPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current text-sky-400" />
                <span>Mulai Review Berkas</span>
              </>
            )}
          </button>
        </form>
      ) : null}

      {reviewable ? (
        <div className="space-y-4">
          {/* Approve Form */}
          <form
            action={apprForm}
            className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-rim space-y-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Setujui (Approve Submission)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfirmasi angka dampak terverifikasi. Transaksi akan memberikan XP dan Impact Points.
              </p>
            </div>

            <input type="hidden" name="submission_id" value={submissionId} />

            {impacts.map((m) => (
              <div key={m.metric_id} className="space-y-1.5">
                <label
                  htmlFor={`verified_${m.metric_id}`}
                  className="block text-xs font-semibold text-slate-700"
                >
                  {m.name} ({m.unit}) —{" "}
                  <span className="text-slate-400 font-mono">
                    dilaporkan: {m.reported_value}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id={m.metric_id === "e0000000-0000-0000-0000-000000000001" || m.name.toLowerCase().includes("waste") || m.name.toLowerCase().includes("sampah") ? "verified_mm-waste" : m.metric_id === "e0000000-0000-0000-0000-000000000002" || m.name.toLowerCase().includes("plant") || m.name.toLowerCase().includes("pohon") ? "verified_mm-plant" : `verified_${m.metric_id}`}
                    name={m.metric_id === "e0000000-0000-0000-0000-000000000001" || m.name.toLowerCase().includes("waste") || m.name.toLowerCase().includes("sampah") ? "verified_mm-waste" : m.metric_id === "e0000000-0000-0000-0000-000000000002" || m.name.toLowerCase().includes("plant") || m.name.toLowerCase().includes("pohon") ? "verified_mm-plant" : `verified_${m.metric_id}`}
                    type="number"
                    min={0}
                    step="any"
                    required
                    defaultValue={m.verified_value ?? m.reported_value}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 font-mono text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {m.unit}
                  </span>
                </div>
              </div>
            ))}

            <Msg state={apprState} />

            <button
              type="submit"
              disabled={apprPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {apprPending ? "Memproses Verifikasi..." : "Approve (Setujui & Terbitkan Reward)"}
            </button>
          </form>

          {/* Revision Form */}
          <form
            action={revForm}
            className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-rim space-y-3"
          >
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-amber-600" />
                <span>Minta Revisi (Hanya 1x Kesempatan)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kembalikan berkas ke relawan jika foto kurang jelas atau kode bukti buram.
              </p>
            </div>

            <input type="hidden" name="submission_id" value={submissionId} />

            <div className="space-y-1">
              <label
                htmlFor="rev-note"
                className="block text-xs font-semibold text-slate-700"
              >
                Instruksi Revisi untuk Relawan *
              </label>
              <textarea
                id="rev-note"
                name="note"
                rows={2}
                required
                maxLength={1000}
                placeholder="Contoh: Foto sesudah aksi terpotong, mohon unggah ulang foto yang menampilkan kode bukti dengan jelas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <Msg state={revState} />

            <button
              type="submit"
              disabled={revPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {revPending ? "Mengirim Permintaan..." : "Minta Revisi Berkas"}
            </button>
          </form>

          {/* Reject Form */}
          <form
            action={rejForm}
            className="rounded-2xl border border-rose-200/80 bg-white p-5 shadow-rim space-y-3"
          >
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <X className="h-4 w-4 text-rose-600" />
                <span>Tolak Permanen (Reject Submission)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan jika bukti palsu, melanggar ketentuan, atau foto duplikasi terdeteksi.
              </p>
            </div>

            <input type="hidden" name="submission_id" value={submissionId} />

            <div className="space-y-1">
              <label
                htmlFor="rej-reason"
                className="block text-xs font-semibold text-slate-700"
              >
                Alasan Penolakan Wajib *
              </label>
              <select
                id="rej-reason"
                name="reason"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rej-note"
                className="block text-xs font-semibold text-slate-700"
              >
                Catatan Penjelasan (Opsional)
              </label>
              <textarea
                id="rej-note"
                name="note"
                rows={2}
                maxLength={1000}
                placeholder="Penjelasan tambahan alasan penolakan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>

            <Msg state={rejState} />

            <button
              type="submit"
              disabled={rejPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {rejPending ? "Memproses Penolakan..." : "Tolak Submission Ini"}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 text-center text-xs text-slate-500 font-mono">
          Status submission telah final ({status}). Tidak ada aksi verifikasi lanjutan yang tersedia.
        </div>
      )}
    </div>
  );
}
