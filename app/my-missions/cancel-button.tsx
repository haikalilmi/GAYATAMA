"use client";

import { useActionState } from "react";
import { cancelParticipationAction, type CancelState } from "./actions";

export function CancelButton({ participationId }: { participationId: string }) {
  const [state, formAction, pending] = useActionState<CancelState | null, FormData>(
    cancelParticipationAction,
    null
  );

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="participation_id" value={participationId} />
      {state?.error ? (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm("Batalkan ikut misi ini?")) e.preventDefault();
        }}
        className="rounded border px-3 py-1 text-xs text-slate-600 disabled:opacity-50"
      >
        {pending ? "Membatalkan..." : "Batalkan"}
      </button>
    </form>
  );
}
