"use client";

import { useActionState } from "react";
import { Camera, KeyRound, Loader2, ArrowRight } from "lucide-react";

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
  const needsSupporting = !requires.before && !requires.after;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name={idName} value={idValue} />

      {/* Photo Uploads Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        {requires.before ? (
          <div className="space-y-2">
            <label htmlFor="before_photo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Before Photo *
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-sky-400 hover:bg-sky-50/20">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-2xs border border-slate-200">
                  <Camera className="h-5 w-5" />
                </div>
                <input
                  id="before_photo"
                  name="before_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WEBP (max 5 MB)</span>
              </div>
            </div>
          </div>
        ) : null}

        {requires.after ? (
          <div className="space-y-2">
            <label htmlFor="after_photo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              After Photo *
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-emerald-400 hover:bg-emerald-50/20">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-2xs border border-slate-200">
                  <Camera className="h-5 w-5" />
                </div>
                <input
                  id="after_photo"
                  name="after_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WEBP (max 5 MB)</span>
              </div>
            </div>
          </div>
        ) : null}

        {needsSupporting ? (
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="supporting_photo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Action Photo *
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-sky-400 hover:bg-sky-50/20">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-2xs border border-slate-200">
                  <Camera className="h-5 w-5" />
                </div>
                <input
                  id="supporting_photo"
                  name="supporting_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WEBP (max 5 MB)</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Description and Field Notes {requires.description ? "*" : ""}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          required={requires.description}
          defaultValue={defaults?.description ?? ""}
          placeholder="Describe the action, the specific location, challenges in the field, and the results achieved..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all leading-relaxed"
        />
      </div>

      {/* Proof Code & Partner Code Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {requires.proofCode ? (
          <div className="space-y-2">
            <label htmlFor="proof_code_input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Confirm Physical Proof Code *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="proof_code_input"
                name="proof_code_input"
                type="text"
                required
                maxLength={32}
                placeholder="e.g. IQ-ABC123"
                defaultValue={defaults?.proof_code_input ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-500">Must match the code on your mission card exactly.</p>
          </div>
        ) : null}

        {requires.partnerCode ? (
          <div className="space-y-2">
            <label htmlFor="partner_code_input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Partner / Event Code *
            </label>
            <input
              id="partner_code_input"
              name="partner_code_input"
              type="text"
              required
              maxLength={64}
              defaultValue={defaults?.partner_code_input ?? ""}
              placeholder="Enter the event code..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
        ) : null}
      </div>

      {/* Numeric Metrics */}
      {metrics.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 space-y-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Measured Impact Values
          </span>
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((m) => {
              const inputId = m.id === "e0000000-0000-0000-0000-000000000001" || m.name.toLowerCase().includes("waste") || m.name.toLowerCase().includes("sampah")
                ? "metric_mm-waste"
                : m.id === "e0000000-0000-0000-0000-000000000002" || m.name.toLowerCase().includes("plant") || m.name.toLowerCase().includes("pohon")
                ? "metric_mm-plant"
                : `metric_${m.id}`;
              return (
                <div key={m.id} className="space-y-1.5">
                  <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
                    {m.name} ({m.unit}) *
                  </label>
                  <div className="relative">
                    <input
                      id={inputId}
                      name={inputId}
                      type="number"
                      min={0}
                      step="any"
                      required
                      defaultValue={defaults?.metrics?.[m.id] ?? defaults?.metrics?.[inputId.slice(7)] ?? ""}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integrity Agreement Checkbox */}
      <div className="rounded-xl border border-slate-200/70 bg-white p-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/20"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I confirm that this action was genuinely carried out in the field, that the documentation is my own, and that the reported data can be verified transparently.
          </span>
        </label>
      </div>

      {state?.error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-2xs">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            <span>{pendingLabel}</span>
          </>
        ) : (
          <>
            <span>{submitLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
