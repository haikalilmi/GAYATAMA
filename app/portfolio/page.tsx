import { requireUser } from "@/lib/auth";
import { getUserPortfolio } from "@/lib/impact";
import { calculateLevel } from "@/lib/level";
import {
  Award,
  ShieldCheck,
  Layers,
  Medal,
  Clock,
} from "lucide-react";

export default async function PortfolioPage() {
  const user = await requireUser("/portfolio");
  const p = await getUserPortfolio(user.id);
  if (!p) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 max-w-lg mx-auto">
        Profil portofolio tidak ditemukan.
      </div>
    );
  }
  const { title } = calculateLevel(p.total_xp);

  return (
    <div className="space-y-8 animate-enter-tactile max-w-4xl">
      {/* Dossier Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
                <ShieldCheck className="h-3 w-3" />
                Portofolio Terverifikasi
              </span>
              <span className="text-xs font-mono text-slate-400">
                AUDITED PROFILE
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {p.full_name}
            </h1>
            <p className="text-sm text-slate-500">
              Relawan Kontributor Terdaftar · Bukti Aksi Lolos Verifikasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white tracking-wide">
              LEVEL: {title}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total XP Terkumpul
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {p.total_xp.toLocaleString("id-ID")}{" "}
              <span className="text-xs text-slate-400">XP</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aksi Terverifikasi
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">
              {p.verifiedActions.toLocaleString("id-ID")}{" "}
              <span className="text-xs text-slate-400">Aksi</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Impact Points
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-700">
              {p.points_balance.toLocaleString("id-ID")}{" "}
              <span className="text-xs text-slate-400">PTS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Verified Environmental & Social Metrics */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="h-4 w-4 text-sky-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Akumulasi Dampak Terverifikasi
          </h2>
        </div>

        {p.metrics.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">
            Belum ada metrik dampak terakumulasi. Hanya submission yang telah disetujui komite yang dihitung.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {p.metrics.map((m) => (
              <div
                key={m.key}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200/60"
              >
                <span className="text-xs font-semibold text-slate-700">
                  {m.label}
                </span>
                <span className="font-mono text-sm font-black text-slate-900">
                  {m.value.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges Collection Rack */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Lencana Pencapaian ({p.badges.length})
            </h2>
          </div>
        </div>

        {p.badges.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">
            Belum ada badge yang terbuka. Terus ikuti misi sosial untuk membuka lencana khusus.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {p.badges.map((b) => (
              <div
                key={b.name}
                className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-2xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Jejak Audit Aktivitas Terakhir
          </h2>
        </div>

        {p.recent.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">
            Belum ada riwayat aktivitas verifikasi.
          </p>
        ) : (
          <ul className="space-y-3">
            {p.recent.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl bg-slate-50/60 p-3.5 border border-slate-200/60 text-xs"
              >
                <span className="font-semibold text-slate-900">
                  {r.mission_title}
                </span>
                <span className="font-mono text-slate-500">
                  {r.verified_at
                    ? new Date(r.verified_at).toLocaleDateString("id-ID")
                    : "Menunggu"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
