import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/impact";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  const { period } = await searchParams;
  const p = period === "month" ? "month" : "all";
  const rows = await getLeaderboard(user?.id ?? null, p);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Top Contributors</h1>
        <p className="text-sm text-slate-500">Peringkat kontribusi terverifikasi (basis XP), bukan nilai moral.</p>
      </div>
      <nav className="flex gap-2 text-sm">
        <Link href="/leaderboard?period=month"
          className={`rounded px-3 py-1.5 ${p === "month" ? "bg-slate-900 text-white" : "border bg-white"}`}>
          Bulan ini
        </Link>
        <Link href="/leaderboard"
          className={`rounded px-3 py-1.5 ${p === "all" ? "bg-slate-900 text-white" : "border bg-white"}`}>
          Sepanjang waktu
        </Link>
      </nav>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className={`flex justify-between rounded border bg-white p-3 text-sm ${r.isYou ? "border-slate-900 font-semibold" : ""}`}>
            <span>#{i + 1} {r.full_name} {r.isYou ? "(kamu)" : ""}</span>
            <span>{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
