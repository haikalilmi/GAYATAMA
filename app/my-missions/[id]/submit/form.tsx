"use client";

import { useActionState } from "react";

export interface EvidenceFormState {
  error: string;
}

interface Props {
  idName: string;
  idValue: string;
  action: (prev: EvidenceFormState | null, form: FormData) => Promise<EvidenceFormState>;
  submitLabel: string;
  pendingLabel: string;
  requires: { before: boolean; after: boolean; description: boolean; proofCode: boolean; partnerCode: boolean };
  metrics: { id: string; name: string; unit: string }[];
  defaults?: { description?: string | null; proof_code_input?: string | null; partner_code_input?: string | null; metrics?: Record<string, number> };
}

export function SubmitForm({ idName, idValue, action, submitLabel, pendingLabel, requires, metrics, defaults }: Props) {
  const [state, formAction, pending] = useActionState<EvidenceFormState | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name={idName} value={idValue} />
      {requires.before ? (
        <div className="space-y-1">
          <label htmlFor="before_photo" className="text-sm font-medium">Foto sebelum *</label>
          <input id="before_photo" name="before_photo" type="file" accept="image/jpeg,image/png,image/webp" required
            className="w-full text-sm" />
        </div>
      ) : null}
      {requires.after ? (
        <div className="space-y-1">
          <label htmlFor="after_photo" className="text-sm font-medium">Foto sesudah *</label>
          <input id="after_photo" name="after_photo" type="file" accept="image/jpeg,image/png,image/webp" required
            className="w-full text-sm" />
        </div>
      ) : null}
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Deskripsi kegiatan {requires.description ? "*" : ""}
        </label>
        <textarea id="description" name="description" rows={4} maxLength={2000} required={requires.description}
          defaultValue={defaults?.description ?? ""}
          className="w-full rounded border bg-white px-3 py-2 text-sm" />
      </div>
      {requires.proofCode ? (
        <div className="space-y-1">
          <label htmlFor="proof_code_input" className="text-sm font-medium">Kode bukti *</label>
          <input id="proof_code_input" name="proof_code_input" type="text" required maxLength={32}
            placeholder="Contoh: IQ-ABC123"
            defaultValue={defaults?.proof_code_input ?? ""}
            className="w-full rounded border bg-white px-3 py-2 font-mono text-sm" />
        </div>
      ) : null}
      {requires.partnerCode ? (
        <div className="space-y-1">
          <label htmlFor="partner_code_input" className="text-sm font-medium">Kode partner/acara *</label>
          <input id="partner_code_input" name="partner_code_input" type="text" required maxLength={64}
            defaultValue={defaults?.partner_code_input ?? ""}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
      ) : null}
      {metrics.map((m) => (
        <div key={m.id} className="space-y-1">
          <label htmlFor={`metric_${m.id}`} className="text-sm font-medium">
            {m.name} ({m.unit}) *
          </label>
          <input id={`metric_${m.id}`} name={`metric_${m.id}`} type="number" min={0} step="any" required
            defaultValue={defaults?.metrics?.[m.id] ?? ""}
            className="w-full rounded border bg-white px-3 py-2 text-sm" />
        </div>
      ))}
      <div className="space-y-1">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required className="mt-1" />
          <span>
            Kegiatan ini asli, bukti milik saya, dan tidak memuat info pribadi sensitif tanpa izin.
          </span>
        </label>
      </div>
      {state?.error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}
        className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
