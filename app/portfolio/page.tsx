import { requireUser } from "@/lib/auth";
import { getUserPortfolio } from "@/lib/impact";
import { calculateLevel } from "@/lib/level";

export default async function PortfolioPage() {
  const user = await requireUser("/portfolio");
  const p = getUserPortfolio(user.id);
  if (!p) return <p>Profil tidak ketemu.</p>;
  const { title } = calculateLevel(p.total_xp);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{p.full_name}</h1>
        <p className="text-sm text-slate-500">
          Level {title} · {p.total_xp} XP · {p.points_balance} poin · {p.verifiedActions} aksi terverifikasi
        </p>
      </div>

      <div className="rounded border bg-white p-4 space-y-1">
        <h2 className="font-semibold">Dampak terverifikasi</h2>
        {p.metrics.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada. Hanya submission disetujui yang dihitung.</p>
        ) : (
          p.metrics.map((m) => (
            <p key={m.key} className="text-sm text-slate-700">{m.label}: {m.value}</p>
          ))
        )}
      </div>

      <div className="rounded border bg-white p-4 space-y-1">
        <h2 className="font-semibold">Badge ({p.badges.length})</h2>
        {p.badges.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada badge.</p>
        ) : (
          p.badges.map((b) => (
            <p key={b.name} className="text-sm text-slate-700"><span className="font-medium">{b.name}</span> — {b.description}</p>
          ))
        )}
      </div>

      <div className="rounded border bg-white p-4 space-y-1">
        <h2 className="font-semibold">Aktivitas terakhir</h2>
        {p.recent.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada.</p>
        ) : (
          p.recent.map((r, i) => (
            <p key={i} className="text-sm text-slate-700">
              {r.mission_title} · {r.verified_at ? new Date(r.verified_at).toLocaleString("id-ID") : "-"}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
