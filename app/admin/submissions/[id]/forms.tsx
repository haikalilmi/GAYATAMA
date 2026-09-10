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

function Msg({ state }: { state: ReviewState | null }) {
  if (!state) return null;
  if (state.error)
    return (
      <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
        {state.ok}
      </p>
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
  impacts: { metric_id: string; name: string; unit: string; reported_value: number; verified_value: number | null }[];
}) {
  const [startState, startForm, startPending] = useActionState<ReviewState | null, FormData>(startReviewAction, null);
  const [apprState, apprForm, apprPending] = useActionState<ReviewState | null, FormData>(approveAction, null);
  const [rejState, rejForm, rejPending] = useActionState<ReviewState | null, FormData>(rejectAction, null);
  const [revState, revForm, revPending] = useActionState<ReviewState | null, FormData>(revisionAction, null);
  const reviewable = status === "PENDING" || status === "UNDER_REVIEW";

  return (
    <div className="space-y-4">
      {status === "PENDING" ? (
        <form action={startForm} className="space-y-2">
          <input type="hidden" name="submission_id" value={submissionId} />
          <Msg state={startState} />
          <button type="submit" disabled={startPending} className="rounded border px-4 py-2 text-sm disabled:opacity-50">
            {startPending ? "Memproses..." : "Mulai review"}
          </button>
        </form>
      ) : null}

      {reviewable ? (
        <>
          <form action={apprForm} className="space-y-2 rounded border bg-white p-4">
            <h2 className="font-semibold">Setujui</h2>
            <input type="hidden" name="submission_id" value={submissionId} />
            {impacts.map((m) => (
              <div key={m.metric_id} className="space-y-1">
                <label htmlFor={`verified_${m.metric_id}`} className="text-sm font-medium">
                  {m.name} ({m.unit}) — dilaporkan {m.reported_value}
                </label>
                <input
                  id={`verified_${m.metric_id}`}
                  name={`verified_${m.metric_id}`}
                  type="number" min={0} step="any" required
                  defaultValue={m.verified_value ?? m.reported_value}
                  className="w-full rounded border bg-white px-3 py-2 text-sm"
                />
              </div>
            ))}
            <Msg state={apprState} />
            <button type="submit" disabled={apprPending}
              className="rounded bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50">
              {apprPending ? "Memproses..." : "Approve"}
            </button>
          </form>

          <form action={revForm} className="space-y-2 rounded border bg-white p-4">
            <h2 className="font-semibold">Minta revisi (sekali saja)</h2>
            <input type="hidden" name="submission_id" value={submissionId} />
            <label htmlFor="rev-note" className="text-sm font-medium">Catatan</label>
            <textarea id="rev-note" name="note" rows={2} required maxLength={1000}
              className="w-full rounded border bg-white px-3 py-2 text-sm" />
            <Msg state={revState} />
            <button type="submit" disabled={revPending}
              className="rounded bg-amber-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              {revPending ? "Memproses..." : "Minta revisi"}
            </button>
          </form>

          <form action={rejForm} className="space-y-2 rounded border bg-white p-4">
            <h2 className="font-semibold">Tolak</h2>
            <input type="hidden" name="submission_id" value={submissionId} />
            <label htmlFor="rej-reason" className="text-sm font-medium">Alasan</label>
            <select id="rej-reason" name="reason" required
              className="w-full rounded border bg-white px-3 py-2 text-sm">
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <label htmlFor="rej-note" className="text-sm font-medium">Catatan (opsional)</label>
            <textarea id="rej-note" name="note" rows={2} maxLength={1000}
              className="w-full rounded border bg-white px-3 py-2 text-sm" />
            <Msg state={rejState} />
            <button type="submit" disabled={rejPending}
              className="rounded bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50">
              {rejPending ? "Memproses..." : "Reject"}
            </button>
          </form>
        </>
      ) : (
        <p className="rounded border bg-white p-4 text-sm text-slate-500">
          Status final: {status}. Tidak ada aksi tersisa.
        </p>
      )}
    </div>
  );
}
