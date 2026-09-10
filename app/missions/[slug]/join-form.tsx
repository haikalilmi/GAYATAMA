"use client";

import { useActionState } from "react";
import { joinMissionAction, type JoinState } from "./actions";

export function JoinForm({ missionId, slug }: { missionId: string; slug: string }) {
  const [state, formAction, pending] = useActionState<JoinState | null, FormData>(joinMissionAction, null);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="mission_id" value={missionId} />
      <input type="hidden" name="slug" value={slug} />
      {state?.error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Ikut misi ini"}
      </button>
    </form>
  );
}
