import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../(auth)/auth-form";
import { loginAction } from "../(auth)/actions";
import { GoogleLoginButton } from "../(auth)/google-login-button";
import { Plane, AlertTriangle } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6 animate-enter-tactile py-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <Plane className="h-6 w-6 -rotate-45 text-sky-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to ImpactQuest
        </h1>
        <p className="text-xs text-slate-500">
          Access the Flight Hub to join social missions and record real impact.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 shadow-2xs flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>
            {error === "auth_failed"
              ? "Google sign-in failed. Please try again."
              : error === "no_email"
                ? "The Google account has no email."
                : "Authentication error. Please try again."}
          </span>
        </div>
      ) : null}

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-rim space-y-5">
        <GoogleLoginButton next={next} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200/80" />
          <span className="text-[11px] font-mono uppercase text-slate-400">
            or email
          </span>
          <div className="h-px flex-1 bg-slate-200/80" />
        </div>

        <AuthForm action={loginAction} submitLabel="Sign In" next={next} />

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          No volunteer account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-slate-900 hover:text-sky-600 underline transition-colors"
          >
            Sign Up Now
          </Link>
        </p>
      </div>

      {/* Demo Credentials Helper Box */}
      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-xs space-y-1.5 font-mono">
        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
          Just looking around? Try a demo account:
        </span>
        <div className="text-slate-600 flex justify-between">
          <span>Volunteer:</span>
          <span className="font-bold text-slate-800">demo@impactquest.local / demo1234</span>
        </div>
        <div className="text-slate-600 flex justify-between">
          <span>Verifier:</span>
          <span className="font-bold text-slate-800">admin@impactquest.local / admin1234</span>
        </div>
      </div>
    </div>
  );
}
