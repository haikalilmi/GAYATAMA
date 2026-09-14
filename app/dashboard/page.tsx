import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserPortfolio } from "@/lib/impact";
import { calculateLevel } from "@/lib/level";
import { listUserParticipations } from "@/lib/participation";
import { listMissions } from "@/lib/missions";
import {
  CheckCircle2,
  Target,
  Gift,
  ArrowRight,
  Clock,
  Compass,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const thresholds = [0, 500, 1200, 2000, 3500];

function formatTimeRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Kedaluwarsa";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `Sisa ${Math.max(1, Math.floor(ms / 60000))} mnt`;
  if (h < 48) return `Sisa ${h} jam`;
  return `Sisa ${Math.floor(h / 24)} hari`;
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const portfolio = await getUserPortfolio(user.id);
  const { title } = calculateLevel(user.total_xp);
  const parts = await listUserParticipations(user.id);
  const active = parts.filter((p) => p.status === "JOINED");
  const joinedIds = new Set(
    parts
      .filter((p) => p.status !== "CANCELLED" && p.status !== "EXPIRED")
      .map((p) => p.mission_id)
  );
  const suggested = (await listMissions({}))
    .filter((m) => !joinedIds.has(m.id))
    .slice(0, 3);

  const idx = thresholds.findIndex((t) => user.total_xp < t);
  const nextAt = idx === -1 ? null : thresholds[idx];
  const base = idx <= 0 ? 0 : thresholds[idx - 1];
  const pct =
    nextAt === null
      ? 100
      : Math.min(
          100,
          Math.round(((user.total_xp - base) / (nextAt - base)) * 100)
        );

  return (
    <div className="space-y-8">
      {/* Header Profile & Flight Deck Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 animate-pulse" />
              Dasbor
            </span>
            <span className="text-xs font-mono text-slate-400">
              ID: {user.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Halo, {user.full_name}
          </h1>
          <p className="text-sm text-slate-500">
            Kontributor Aktif · Divisi Aksi Sosial & Restorasi Lingkungan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>Jelajahi Misi</span>
          </Link>
          <Link
            href="/rewards"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Gift className="h-4 w-4 text-sky-600" />
            <span>Tukar Reward</span>
          </Link>
        </div>
      </div>

      {/* Flight Level Progress / XP Telemetry Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status Level
                </span>
                <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white tracking-wide">
                  {title}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi seluruh kontribusi terverifikasi tim penilai
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900">
              {user.total_xp.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1">XP</span>
            <p className="text-xs text-slate-500 font-mono">
              {nextAt === null
                ? "Level Maksimal Tercapai"
                : `${(nextAt - user.total_xp).toLocaleString("id-ID")} XP menuju level berikutnya`}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{base} XP</span>
            <span className="text-sky-600 font-semibold">{pct}%</span>
            <span>{nextAt ?? "MAX"} XP</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/50">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Telemetry Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:shadow-rim-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Aksi Terverifikasi
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {portfolio?.verifiedActions ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Aksi lolos audit komite verifikator
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:shadow-rim-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Misi Aktif Lapangan
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {active.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Menunggu penyelesaian & submit bukti
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:shadow-rim-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saldo Impact Points
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {user.points_balance.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Poin aktif siap ditukar voucher demo
            </p>
          </div>
        </div>
      </div>

      {/* Misi Aktif Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Misi Aktif Lapangan
            </h2>
            <p className="text-xs text-slate-500">
              Misi yang sedang kamu jalankan dengan slot proof code aktif
            </p>
          </div>
          <Link
            href="/my-missions"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Compass className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Belum ada misi aktif yang sedang diikuti
            </p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Pilih misi sosial yang relevan, simpan kode bukti unik, dan lakukan aksi nyata di lapangan.
            </p>
            <Link
              href="/missions"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <span>Eksplorasi Misi Lapangan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((a) => (
              <div
                key={a.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:shadow-rim-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                      {a.proof_code}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      <Clock className="h-3 w-3" />
                      {formatTimeRemaining(a.expires_at)}
                    </span>
                  </div>
                  <Link
                    href={`/missions/${a.mission_slug}`}
                    className="mt-3 block font-bold text-slate-900 hover:text-sky-600 transition-colors"
                  >
                    {a.mission_title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500 font-mono">
                    Tenggat: {new Date(a.expires_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/missions/${a.mission_slug}`}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/my-missions/${a.id}/submit`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition-colors"
                  >
                    <span>Submit Bukti</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rekomendasi Misi Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Saran Misi Rekomendasi
            </h2>
            <p className="text-xs text-slate-500">
              Misi prioritas tinggi yang membutuhkan dukungan relawan terverifikasi
            </p>
          </div>
          <Link
            href="/missions"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Semua Misi</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {suggested.map((m) => (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-rim transition-all hover:-translate-y-0.5 hover:shadow-rim-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                    {m.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {m.difficulty}
                  </span>
                </div>
                <Link
                  href={`/missions/${m.slug}`}
                  className="mt-3 block font-bold text-slate-900 hover:text-sky-600 transition-colors line-clamp-2"
                >
                  {m.title}
                </Link>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {m.short_description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-mono font-semibold text-slate-900">
                  <span className="text-sky-600">+{m.xp_reward} XP</span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span className="text-amber-600">+{m.point_reward} Pts</span>
                </div>
                <Link
                  href={`/missions/${m.slug}`}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label={`Buka misi ${m.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
