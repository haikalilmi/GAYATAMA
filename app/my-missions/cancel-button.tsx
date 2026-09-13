"use client";

import { useActionState } from "react";
import { cancelParticipationAction, type CancelState } from "./actions";
import { XCircle } from "lucide-react";

export function CancelButton({ participationId }: { participationId: string }) {
  const [state, formAction, pending] = useActionState<CancelState | null, FormData>(
    cancelParticipationAction,
    null
  );

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="participation_id" value={participationId} />
      {state?.error ? (
        <p role="alert" className="text-xs text-rose-600 mb-1">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm("Batalkan keikutsertaan misi ini? Slot kode bukti akan dikembalikan."))
            e.preventDefault();
        }}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
      >
        <XCircle className="h-3.5 w-3.5 text-slate-400" />
        <span>{pending ? "Membatalkan..." : "Batalkan Slot"}</span>
      </button>
    </form>
  );
}
