"use client";

import { useActionState } from "react";
import { joinMissionAction, type JoinState } from "./actions";
import { ArrowRight } from "lucide-react";

export function JoinForm({
  missionId,
  slug,
}: {
  missionId: string;
  slug: string;
}) {
  const [state, formAction, pending] = useActionState<JoinState | null, FormData>(
    joinMissionAction,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="mission_id" value={missionId} />
      <input type="hidden" name="slug" value={slug} />
      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 shadow-2xs"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <span>Reserving your mission slot...</span>
        ) : (
          <>
            <span>Join This Mission</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
