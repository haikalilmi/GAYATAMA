"use client";

import { useActionState } from "react";
import { createRewardAction, updateRewardAction, type RewardState } from "./actions";
import type { RewardForm } from "@/lib/rewards-admin";

export function RewardForm({
  rewardId,
  initial,
  mode,
}: {
  rewardId?: string;
  initial?: Partial<RewardForm>;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<RewardState | null, FormData>(
    mode === "create" ? createRewardAction : updateRewardAction,
    null
  );
  const v = (k: keyof RewardForm) => (initial?.[k] as string | number | undefined) ?? "";

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {rewardId ? <input type="hidden" name="reward_id" value={rewardId} /> : null}
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">Title *</label>
        <input id="title" name="title" required minLength={3} maxLength={120} defaultValue={v("title")}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} maxLength={1000} defaultValue={v("description")}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="point_cost" className="text-sm font-medium">Point cost *</label>
          <input id="point_cost" name="point_cost" type="number" min={1} required defaultValue={v("point_cost") === "" ? 500 : v("point_cost")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="demo_value" className="text-sm font-medium">Demo value</label>
          <input id="demo_value" name="demo_value" type="number" min={0} step="any" defaultValue={v("demo_value")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="stock" className="text-sm font-medium">Stock *</label>
          <input id="stock" name="stock" type="number" min={0} required defaultValue={v("stock") === "" ? 10 : v("stock")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select id="status" name="status" defaultValue={v("status") || "ACTIVE"}
            className="w-full rounded border bg-white px-2 py-2 text-sm">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>
      {state?.error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {!state?.error && mode === "edit" && state ? (
        <p role="status" className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Saved.
        </p>
      ) : null}
      <button type="submit" disabled={pending}
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Saving..." : mode === "create" ? "Create reward" : "Save"}
      </button>
    </form>
  );
}
