import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../(auth)/auth-form";
import { loginAction } from "../(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-slate-500">
          Masuk untuk ikut misi dan lacak impact.
        </p>
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
