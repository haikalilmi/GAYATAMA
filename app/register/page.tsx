import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../(auth)/auth-form";
import { registerAction } from "../(auth)/actions";
import { GoogleLoginButton } from "../(auth)/google-login-button";
import { Plane } from "lucide-react";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-sm space-y-6 animate-enter-tactile py-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <Plane className="h-6 w-6 -rotate-45 text-sky-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Join as Contributor
        </h1>
        <p className="text-xs text-slate-500">
          Join as a volunteer to start taking missions and recording real actions.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-rim space-y-5">
        <GoogleLoginButton label="Sign Up Quickly with Google" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200/80" />
          <span className="text-[11px] font-mono uppercase text-slate-400">
            or account details
          </span>
          <div className="h-px flex-1 bg-slate-200/80" />
        </div>

        <AuthForm action={registerAction} submitLabel="Create Volunteer Account" showName />

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-slate-900 hover:text-sky-600 underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
