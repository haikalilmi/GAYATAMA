import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserPortfolio } from "@/lib/impact";
import { calculateLevel } from "@/lib/level";
import { listUserParticipations } from "@/lib/participation";
import { listMissions } from "@/lib/missions";

const thresholds = [0, 500, 1200, 2000, 3500];

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const portfolio = getUserPortfolio(user.id);
  const { title } = calculateLevel(user.total_xp);
  const parts = listUserParticipations(user.id);
  const active = parts.filter((p) => p.status === "JOINED");
  const joinedIds = new Set(parts.filter((p) => p.status !== "CANCELLED" && p.status !== "EXPIRED").map((p) => p.mission_id));
  const suggested = listMissions({}).filter((m) => !joinedIds.has(m.id)).slice(0, 3);

  const idx = thresholds.findIndex((t) => user.total_xp < t);
  const nextAt = idx === -1 ? null : thresholds[idx];
  const base = idx <= 0 ? 0 : thresholds[idx - 1];
  const pct = nextAt === null ? 100 : Math.min(100, Math.round(((user.total_xp - base) / (nextAt - base)) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Halo, {user.full_name}</h1>
        <p className="text-sm text-slate-500">Level {title} · {user.points_balance} Impact Points</p>
      </div>

      <div className="rounded border bg-white p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>{user.total_xp} XP</span>
          <span className="text-slate-500">{nextAt === null ? "Level maks" : `${nextAt - user.total_xp} XP lagi`}</span>
        </div>
        <div className="h-2 rounded bg-slate-100">
          <div className="h-2 rounded bg-slate-900" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Aksi terverifikasi</p>
          <p className="text-2xl font-bold">{portfolio?.verifiedActions ?? 0}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Misi aktif</p>
          <p className="text-2xl font-bold">{active.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Misi aktifmu</h2>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada. <Link href="/missions" className="underline">Jelajahi misi</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {active.map((a) => (
              <li key={a.id} className="flex justify-between gap-2 rounded border bg-white p-3 text-sm">
                <Link href={`/missions/${a.mission_slug}`} className="font-medium hover:underline">
                  {a.mission_title}
                </Link>
                <Link href={`/my-missions/${a.id}/submit`} className="underline">Submit</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Saran misi</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {suggested.map((m) => (
            <li key={m.id} className="rounded border bg-white p-3 text-sm space-y-1">
              <Link href={`/missions/${m.slug}`} className="font-medium hover:underline">{m.title}</Link>
              <p className="text-slate-500">+{m.xp_reward} XP · +{m.point_reward} poin</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
