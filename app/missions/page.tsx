import Link from "next/link";
import {
  categories,
  difficulties,
  listMissions,
  missionTypes,
  parseMissionFilter,
} from "@/lib/missions";
import {
  Target,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";

const labels: Record<string, string> = {
  ENVIRONMENT: "Lingkungan",
  EDUCATION: "Edukasi",
  COMMUNITY: "Komunitas",
  DIGITAL: "Digital",
  SOCIAL: "Sosial",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HIGH: "Sulit",
  STANDARD: "Standar",
  LIMITED: "Terbatas",
  SPONSORED: "Sponsor",
};

export const dynamic = "force-dynamic";

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = parseMissionFilter(await searchParams);
  const missions = await listMissions(filter);
  const isFiltered =
    filter.category || filter.difficulty || filter.mission_type || filter.q;

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
              <Target className="h-3 w-3" />
              MISSION DISPATCH
            </span>
            <span className="text-xs font-mono text-slate-400">
              {missions.length} MISI TERSEDIA
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Jelajahi Misi Lapangan
          </h1>
          <p className="text-sm text-slate-500">
            Pilih misi sosial terverifikasi, selesaikan di lapangan, dan kumpulkan poin reward.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-rim">
        <form method="get" className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={filter.q ?? ""}
              placeholder="Cari misi sosial, pembersihan, dsb..."
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="w-36">
            <select
              id="category"
              name="category"
              defaultValue={filter.category ?? "ALL"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {labels[c] ?? c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="w-32">
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={filter.difficulty ?? "ALL"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Level</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {labels[d] ?? d}
                </option>
              ))}
            </select>
          </div>

          {/* Mission Type Filter */}
          <div className="w-32">
            <select
              id="mission_type"
              name="mission_type"
              defaultValue={filter.mission_type ?? "ALL"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              {missionTypes.map((t) => (
                <option key={t} value={t}>
                  {labels[t] ?? t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Terapkan</span>
            </button>
            {isFiltered ? (
              <Link
                href="/missions"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      {/* Mission Grid */}
      {missions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-semibold text-slate-800">
            Tidak ada misi cocok dengan kriteria filter
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Coba ubah kata kunci pencarian atau bersihkan parameter filter kategori.
          </p>
          <Link
            href="/missions"
            className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Bersihkan Filter
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim transition-all duration-200 hover:-translate-y-1 hover:shadow-rim-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200/60">
                      {labels[m.category] ?? m.category}
                    </span>
                    <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 border border-sky-200/50 font-mono">
                      {labels[m.difficulty] ?? m.difficulty}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {labels[m.mission_type] ?? m.mission_type}
                  </span>
                </div>

                <Link
                  href={`/missions/${m.slug}`}
                  className="mt-4 block text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors"
                >
                  {m.title}
                </Link>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {m.short_description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-1 text-sky-700 border border-sky-200/60">
                    <Sparkles className="h-3 w-3" />
                    +{m.xp_reward} XP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-amber-700 border border-amber-200/60">
                    +{m.point_reward} Poin
                  </span>
                </div>

                <Link
                  href={`/missions/${m.slug}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white group-hover:bg-sky-600 transition-colors shadow-2xs"
                >
                  <span>Lihat Detail</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
