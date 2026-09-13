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
import { ArrowRight, Loader2, Check as CheckIcon } from "lucide-react";

export function StatusButtons({
  missionId,
  actions,
}: {
  missionId: string;
  actions: string[];
}) {
  const [state, formAction] = useActionState<MissionState | null, FormData>(
    missionStatusAction,
    null
  );
  if (actions.length === 0)
    return <span className="text-xs font-mono text-slate-400">Final</span>;

  return (
    <span className="flex items-center justify-end gap-1.5">
      {state?.error ? (
        <span className="text-[10px] text-rose-700">{state.error}</span>
      ) : null}
      {actions.map((a) => (
        <form key={a} action={formAction} className="inline">
          <input type="hidden" name="mission_id" value={missionId} />
          <input type="hidden" name="next_status" value={a} />
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            → {a}
          </button>
        </form>
      ))}
    </span>
  );
}

function Check({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={checked}
        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500/20"
      />
      <span>{label}</span>
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
  const [state, formAction, pending] = useActionState<
    MissionState | null,
    FormData
  >(mode === "create" ? createMissionAction : updateMissionAction, null);
  const v = (k: keyof MissionForm) =>
    (initial?.[k] as string | number | undefined) ?? "";

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim"
    >
      {missionId ? (
        <input type="hidden" name="mission_id" value={missionId} />
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Judul Misi *
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={v("title")}
          placeholder="Contoh: Pembersihan Pesisir Pantai Marina"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="short_description"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Ringkasan Singkat *
        </label>
        <input
          id="short_description"
          name="short_description"
          required
          minLength={3}
          maxLength={300}
          defaultValue={v("short_description")}
          placeholder="Deskripsi satu kalimat yang tampil di katalog..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Deskripsi Lengkap & Instruksi Aksi *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          minLength={3}
          maxLength={5000}
          defaultValue={v("description")}
          placeholder="Rincian prosedur lapangan, peralatan yang dibutuhkan, dan kriteria keberhasilan..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label
            htmlFor="category"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Kategori
          </label>
          <select
            id="category"
            name="category"
            defaultValue={v("category") || "ENVIRONMENT"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="difficulty"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Level
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={v("difficulty") || "EASY"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            {difficulties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="mission_type"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Tipe
          </label>
          <select
            id="mission_type"
            name="mission_type"
            defaultValue={v("mission_type") || "STANDARD"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            {missionTypes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="repeat_type"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Pengulangan
          </label>
          <select
            id="repeat_type"
            name="repeat_type"
            defaultValue={v("repeat_type") || "ONCE"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            {["ONCE", "WEEKLY", "REPEATABLE"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="xp_reward"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Reward XP
          </label>
          <input
            id="xp_reward"
            name="xp_reward"
            type="number"
            min={0}
            required
            defaultValue={v("xp_reward") === "" ? 100 : v("xp_reward")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="point_reward"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Reward Poin
          </label>
          <input
            id="point_reward"
            name="point_reward"
            type="number"
            min={0}
            required
            defaultValue={v("point_reward") === "" ? 30 : v("point_reward")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="participation_expiry_hours"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Batas Submit (Jam)
          </label>
          <input
            id="participation_expiry_hours"
            name="participation_expiry_hours"
            type="number"
            min={1}
            required
            defaultValue={
              v("participation_expiry_hours") === ""
                ? 48
                : v("participation_expiry_hours")
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Syarat Protokol Bukti
        </p>
        <div className="grid gap-2 sm:grid-cols-2 pt-1">
          <Check
            name="requires_before_photo"
            label="Foto Sebelum (Before)"
            checked={initial?.requires_before_photo === 1}
          />
          <Check
            name="requires_after_photo"
            label="Foto Sesudah (After)"
            checked={initial?.requires_after_photo === 1}
          />
          <Check
            name="requires_description"
            label="Deskripsi Catatan Lapangan"
            checked={
              initial ? initial.requires_description === 1 : true
            }
          />
          <Check
            name="requires_proof_code"
            label="Wajib Kode Bukti Fisik"
            checked={initial?.requires_proof_code === 1}
          />
          <Check
            name="requires_partner_code"
            label="Wajib Kode Mitra/Acara"
            checked={initial?.requires_partner_code === 1}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Metrik Dampak Terukur (Maksimal 2)
        </p>
        {[1, 2].map((n) => (
          <div key={n} className="grid grid-cols-3 gap-2">
            <input
              name={`metric${n}_name`}
              placeholder={`Nama Metrik ${n} (cth: Sampah)`}
              maxLength={80}
              defaultValue={
                (initial?.[
                  `metric${n}_name` as keyof MissionForm
                ] as string | undefined) ?? ""
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <input
              name={`metric${n}_key`}
              placeholder={`Key ${n} (cth: waste_kg)`}
              maxLength={40}
              defaultValue={
                (initial?.[
                  `metric${n}_key` as keyof MissionForm
                ] as string | undefined) ?? ""
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <input
              name={`metric${n}_unit`}
              placeholder="Unit (cth: kg, pohon)"
              maxLength={20}
              defaultValue={
                (initial?.[
                  `metric${n}_unit` as keyof MissionForm
                ] as string | undefined) ?? ""
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        ))}
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 shadow-2xs"
        >
          {state.error}
        </div>
      ) : null}

      {!state?.error && mode === "edit" && state ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 shadow-2xs flex items-center gap-1.5"
        >
          <CheckIcon className="h-4 w-4 text-emerald-600" />
          <span>Data misi berhasil disimpan ke database.</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            <span>Menyimpan Misi...</span>
          </>
        ) : (
          <>
            <span>
              {mode === "create" ? "Buat Misi Baru (Status DRAFT)" : "Simpan Perubahan Misi"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
