import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fadmin");

  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center space-y-4 shadow-rim">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Akses ditolak (Dibatasi)</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Portal verifikasi dan audit hanya dapat diakses oleh akun verifikator / admin berwenang. Kamu terdeteksi login sebagai <strong className="text-slate-900">{user.email}</strong> ({user.role}).
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Dashboard Kontributor</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
              <ShieldCheck className="h-3 w-3 text-sky-400" />
              Portal Admin
            </span>
            <span className="text-xs font-mono text-slate-400">
              PORTAL VERIFIKASI & AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operator: <span className="font-mono text-slate-700">{user.email}</span> · Hak Akses Verifikator Utama
          </p>
        </div>

        <AdminNav />
      </div>

      {children}
    </div>
  );
}
