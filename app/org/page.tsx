import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCampaigns } from "@/lib/campaigns";

export default async function OrgDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Forg");
  if (user.role !== "ORGANIZATION" && user.role !== "ADMIN") {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Akses ditolak.</h1>
        <p className="text-sm text-slate-600">Halaman organisasi hanya untuk ORGANIZATION (demo: org@impactquest.local).</p>
        <Link href="/dashboard" className="text-sm underline">Kembali</Link>
      </div>
    );
  }
  const campaigns = getCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard Organisasi</h1>
        <p className="text-sm text-slate-500">Halo, {user.full_name}. Data prototype, sebagian simulasi.</p>
      </div>
      {campaigns.map((c) => (
        <div key={c.id} className="rounded border bg-white p-4 space-y-1 text-sm">
          <Link href={`/campaigns/${c.slug}`} className="font-semibold hover:underline">{c.name}</Link>
          <p className="text-slate-600">
            {c.current.toLocaleString("id-ID")} / {(c.target_value ?? 0).toLocaleString("id-ID")} kg ·{" "}
            {c.participants} partisipan · {c.actions} aksi
          </p>
          <p className="text-xs text-slate-500">Demo pool, bukan dana nyata.</p>
        </div>
      ))}
    </div>
  );
}
