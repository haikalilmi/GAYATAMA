import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../(auth)/auth-form";
import { loginAction } from "../(auth)/actions";
import { GoogleLoginButton } from "../(auth)/google-login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-slate-500">
          Masuk untuk ikut misi dan lacak impact.
        </p>
      </div>
      {error ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "auth_failed"
            ? "Login Google gagal. Coba lagi."
            : error === "no_email"
              ? "Akun Google tidak memiliki email."
              : "Terjadi kesalahan. Coba lagi."}
        </p>
      ) : null}
      <GoogleLoginButton next={next} />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">atau</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <AuthForm action={loginAction} submitLabel="Login" next={next} />
      <p className="text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href="/register" className="underline">
          Daftar
        </Link>
      </p>
      <p className="rounded border bg-white p-3 text-xs text-slate-500">
        Demo lomba: demo@impactquest.local / demo1234 (user), admin@impactquest.local
        / admin1234 (admin).
      </p>
    </div>
  );
}
