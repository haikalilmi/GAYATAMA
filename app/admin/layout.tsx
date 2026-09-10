import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "ADMIN") {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Akses ditolak.</h1>
        <p className="text-sm text-slate-600">
          Halaman admin hanya untuk ADMIN. Kamu login sebagai {user.email} (
          {user.role}).
        </p>
        <Link href="/dashboard" className="text-sm underline">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admin</h1>
        <nav className="flex gap-4 pt-1 text-sm">
          <Link href="/admin" className="underline">Dashboard</Link>
          <Link href="/admin/submissions" className="underline">Antrian</Link>
          <Link href="/admin/missions" className="underline">Misi</Link>
          <Link href="/admin/rewards" className="underline">Reward</Link>
          <Link href="/admin/analytics" className="underline">Analitik</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
