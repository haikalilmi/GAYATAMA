"use client";

import { useActionState } from "react";
import { redeemAction, type RedeemState } from "./actions";

export function RedeemButton({ rewardId, disabled, reason }: { rewardId: string; disabled: boolean; reason?: string }) {
  const [state, formAction, pending] = useActionState<RedeemState | null, FormData>(redeemAction, null);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="reward_id" value={rewardId} />
      {state?.error ? (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || pending}
        onClick={(e) => {
          if (!confirm("Tukar poin dengan reward ini?")) e.preventDefault();
        }}
        className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : reason ?? "Tukar"}
      </button>
    </form>
  );
}
