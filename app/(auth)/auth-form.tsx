"use client";

import { useActionState } from "react";
import type { AuthState } from "./actions";
import { Loader2, ArrowRight } from "lucide-react";

interface Props {
  action: (prev: AuthState | null, form: FormData) => Promise<AuthState>;
  submitLabel: string;
  next?: string;
  showName?: boolean;
}

export function AuthForm({ action, submitLabel, next, showName }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {showName ? (
        <div className="space-y-1.5">
          <label
            htmlFor="full_name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Nama Lengkap
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Nama Lengkapmu"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Alamat Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="email@domain.com"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          autoComplete={showName ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 shadow-2xs"
        >
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
            <span>Memvalidasi kredensial...</span>
          </>
        ) : (
          <>
            <span>{submitLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
