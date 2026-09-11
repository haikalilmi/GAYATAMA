import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../(auth)/auth-form";
import { registerAction } from "../(auth)/actions";
import { GoogleLoginButton } from "../(auth)/google-login-button";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Daftar</h1>
        <p className="text-sm text-slate-500">
          Buat akun untuk mulai ikut misi sosial.
        </p>
      </div>
      <GoogleLoginButton label="Daftar dengan Google" />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">atau</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <AuthForm action={registerAction} submitLabel="Daftar" showName />
      <p className="text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}
