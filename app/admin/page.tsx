import Link from "next/link";
import { getAdminStats } from "@/lib/admin";

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded border bg-white p-4 hover:border-slate-400">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Link>
  );
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Pending review" value={stats.pending} href="/admin/submissions?tab=pending" />
        <Stat label="Risiko tinggi" value={stats.highRisk} href="/admin/submissions?tab=flagged" />
        <Stat label="Misi aktif" value={stats.activeMissions} href="/missions" />
        <Stat label="Terverifikasi hari ini" value={stats.verifiedToday} href="/admin/submissions?tab=approved" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Antrian review</h2>
          <Link href="/admin/submissions" className="text-sm underline">
            Semua
          </Link>
        </div>
        {stats.queuePreview.length === 0 ? (
          <p className="rounded border bg-white p-4 text-sm text-slate-500">Antrian kosong.</p>
        ) : (
          <ul className="space-y-2">
            {stats.queuePreview.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded border bg-white p-3 text-sm">
                <span>
                  <Link href={`/admin/submissions/${r.id}`} className="font-medium hover:underline">
                    {r.mission_title}
                  </Link>{" "}
                  · {r.user_name} · <span className="text-slate-500">{r.risk_level}({r.risk_score})</span>
                </span>
                <span className="text-slate-500">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Aktivitas verifikasi terakhir</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="rounded border bg-white p-4 text-sm text-slate-500">Belum ada.</p>
        ) : (
          <ul className="space-y-2">
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="rounded border bg-white p-3 text-sm">
                {a.action} · {a.mission_title} · {a.user_name} ·{" "}
                <span className="text-slate-500">{new Date(a.created_at).toLocaleString("id-ID")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
