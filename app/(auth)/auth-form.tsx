"use client";

import { useActionState } from "react";
import type { AuthState } from "./actions";

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
        <div className="space-y-1">
          <label htmlFor="full_name" className="text-sm font-medium">
            Nama lengkap
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="w-full rounded border bg-white px-3 py-2 text-sm"
          />
        </div>
      ) : null}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          autoComplete={showName ? "new-password" : "current-password"}
          className="w-full rounded border bg-white px-3 py-2 text-sm"
        />
      </div>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state?.error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : submitLabel}
      </button>
    </form>
  );
}
