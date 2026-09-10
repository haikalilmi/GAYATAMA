"use client";

import { useActionState } from "react";
import {
  createMissionAction,
  missionStatusAction,
  updateMissionAction,
  type MissionState,
} from "./actions";
import type { MissionForm } from "@/lib/missions";
import { categories, difficulties, missionTypes } from "@/lib/mission-constants";

export function StatusButtons({ missionId, actions }: { missionId: string; actions: string[] }) {
  const [state, formAction] = useActionState<MissionState | null, FormData>(missionStatusAction, null);
  if (actions.length === 0) return <span className="text-xs text-slate-400">final</span>;
  return (
    <span className="flex gap-1">
      {state?.error ? <span className="text-xs text-red-700">{state.error}</span> : null}
      {actions.map((a) => (
        <form key={a} action={formAction} className="inline">
          <input type="hidden" name="mission_id" value={missionId} />
          <input type="hidden" name="next_status" value={a} />
          <button type="submit" className="rounded border px-2 py-0.5 text-xs">
            →{a}
          </button>
        </form>
      ))}
    </span>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} />
      {label}
    </label>
  );
}

export function MissionForm({
  missionId,
  initial,
  mode,
}: {
  missionId?: string;
  initial?: Partial<MissionForm>;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<MissionState | null, FormData>(
    mode === "create" ? createMissionAction : updateMissionAction,
    null
  );
  const v = (k: keyof MissionForm) => (initial?.[k] as string | number | undefined) ?? "";

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {missionId ? <input type="hidden" name="mission_id" value={missionId} /> : null}
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">Judul *</label>
        <input id="title" name="title" required minLength={3} maxLength={120} defaultValue={v("title")}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="short_description" className="text-sm font-medium">Ringkasan *</label>
        <input id="short_description" name="short_description" required minLength={3} maxLength={300} defaultValue={v("short_description")}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">Deskripsi *</label>
        <textarea id="description" name="description" rows={4} required minLength={3} maxLength={5000} defaultValue={v("description")}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">Kategori</label>
          <select id="category" name="category" defaultValue={v("category") || "ENVIRONMENT"}
            className="w-full rounded border bg-white px-2 py-2 text-sm">
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="difficulty" className="text-sm font-medium">Level</label>
          <select id="difficulty" name="difficulty" defaultValue={v("difficulty") || "EASY"}
            className="w-full rounded border bg-white px-2 py-2 text-sm">
            {difficulties.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="mission_type" className="text-sm font-medium">Tipe</label>
          <select id="mission_type" name="mission_type" defaultValue={v("mission_type") || "STANDARD"}
            className="w-full rounded border bg-white px-2 py-2 text-sm">
            {missionTypes.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="repeat_type" className="text-sm font-medium">Ulang</label>
          <select id="repeat_type" name="repeat_type" defaultValue={v("repeat_type") || "ONCE"}
            className="w-full rounded border bg-white px-2 py-2 text-sm">
            {["ONCE", "WEEKLY", "REPEATABLE"].map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label htmlFor="xp_reward" className="text-sm font-medium">XP</label>
          <input id="xp_reward" name="xp_reward" type="number" min={0} required defaultValue={v("xp_reward") === "" ? 100 : v("xp_reward")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="point_reward" className="text-sm font-medium">Poin</label>
          <input id="point_reward" name="point_reward" type="number" min={0} required defaultValue={v("point_reward") === "" ? 30 : v("point_reward")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="participation_expiry_hours" className="text-sm font-medium">Expiry (jam)</label>
          <input id="participation_expiry_hours" name="participation_expiry_hours" type="number" min={1} required
            defaultValue={v("participation_expiry_hours") === "" ? 48 : v("participation_expiry_hours")}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-2 rounded border bg-white p-3">
        <p className="text-sm font-medium">Syarat bukti</p>
        <Check name="requires_before_photo" label="Foto sebelum" checked={initial?.requires_before_photo === 1} />
        <Check name="requires_after_photo" label="Foto sesudah" checked={initial?.requires_after_photo === 1} />
        <Check name="requires_description" label="Deskripsi" checked={initial ? initial.requires_description === 1 : true} />
        <Check name="requires_proof_code" label="Kode bukti" checked={initial?.requires_proof_code === 1} />
        <Check name="requires_partner_code" label="Kode partner" checked={initial?.requires_partner_code === 1} />
      </div>
      <div className="space-y-2 rounded border bg-white p-3">
        <p className="text-sm font-medium">Metrik dampak (maks 2)</p>
        {[1, 2].map((n) => (
          <div key={n} className="grid grid-cols-3 gap-2">
            <input name={`metric${n}_name`} placeholder={`Nama ${n}`} maxLength={80}
              defaultValue={(initial?.[`metric${n}_name` as keyof MissionForm] as string | undefined) ?? ""}
              className="rounded border px-2 py-1.5 text-sm" />
            <input name={`metric${n}_key`} placeholder={`key_${n}`} maxLength={40}
              defaultValue={(initial?.[`metric${n}_key` as keyof MissionForm] as string | undefined) ?? ""}
              className="rounded border px-2 py-1.5 text-sm" />
            <input name={`metric${n}_unit`} placeholder="unit" maxLength={20}
              defaultValue={(initial?.[`metric${n}_unit` as keyof MissionForm] as string | undefined) ?? ""}
              className="rounded border px-2 py-1.5 text-sm" />
          </div>
        ))}
      </div>
      {state?.error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {!state?.error && mode === "edit" && state ? (
        <p role="status" className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Tersimpan.
        </p>
      ) : null}
      <button type="submit" disabled={pending}
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Menyimpan..." : mode === "create" ? "Buat misi (DRAFT)" : "Simpan"}
      </button>
    </form>
  );
}
