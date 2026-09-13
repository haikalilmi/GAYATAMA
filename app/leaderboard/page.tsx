import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/impact";
import { Trophy } from "lucide-react";

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
    <div className="mx-auto max-w-2xl space-y-8 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
              <Trophy className="h-3 w-3" />
              FLIGHT ROSTER
            </span>
            <span className="text-xs font-mono text-slate-400">
              TOP KONTRIBUTOR
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Papan Peringkat
          </h1>
          <p className="text-sm text-slate-500">
            Peringkat aksi terverifikasi berbasis akumulasi XP yang telah diaudit.
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <Link
            href="/leaderboard?period=month"
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              p === "month"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bulan Ini
          </Link>
          <Link
            href="/leaderboard"
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              p === "all"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sepanjang Waktu
          </Link>
        </div>
      </div>

      {/* Roster Ranking List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-4 shadow-rim">
        <ol className="divide-y divide-slate-100">
          {rows.map((r, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            return (
              <li
                key={i}
                className={`flex items-center justify-between gap-4 rounded-xl p-3.5 sm:px-4 transition-all ${
                  r.isYou
                    ? "bg-sky-50/70 border border-sky-200/80 shadow-2xs font-semibold"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      rank === 1
                        ? "bg-amber-100 text-amber-800 border border-amber-300/80"
                        : rank === 2
                          ? "bg-slate-200 text-slate-800 border border-slate-300"
                          : rank === 3
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    #{rank}
                  </div>

                  {/* Contributor Name */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {r.full_name}{" "}
                      {r.isYou && (
                        <span className="ml-1 rounded-md bg-sky-600 px-1.5 py-0.2 text-[10px] font-semibold text-white">
                          Kamu
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {isTop3 ? "Relawan Elit Terverifikasi" : "Kontributor Aktif"}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-black text-slate-900">
                    {r.xp.toLocaleString("id-ID")}
                  </span>
                  <span className="font-mono text-xs text-slate-400 ml-1">XP</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="text-center text-xs text-slate-400 font-mono">
        Peringkat diperbarui secara otomatis setiap kali verifikasi aksi disetujui.
      </p>
    </div>
  );
}
