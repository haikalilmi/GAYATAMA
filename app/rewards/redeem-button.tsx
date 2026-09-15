"use client";

import { useActionState } from "react";
import { redeemAction, type RedeemState } from "./actions";
import { Gift, Loader2 } from "lucide-react";

export function RedeemButton({
  rewardId,
  disabled,
  reason,
}: {
  rewardId: string;
  disabled: boolean;
  reason?: string;
}) {
  const [state, formAction, pending] = useActionState<RedeemState | null, FormData>(
    redeemAction,
    null
  );

  return (
    <form action={formAction} className="space-y-1.5 w-full">
      <input type="hidden" name="reward_id" value={rewardId} />
      {state?.error ? (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || pending}
        onClick={(e) => {
          if (!confirm("Redeem your impact points for this sponsor reward?"))
            e.preventDefault();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
            <span>Memproses Penukaran...</span>
          </>
        ) : (
          <>
            <Gift className="h-3.5 w-3.5 text-sky-400" />
            <span>{reason ?? "Redeem Reward Now"}</span>
          </>
        )}
      </button>
    </form>
  );
}
