import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/campaigns";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Flag,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCampaignBySlug(slug);
  if (!c) notFound();
  const pct = c.target_value
    ? Math.min(100, Math.round((c.current / c.target_value) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-enter-tactile">
      {/* Campaign Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
            <Flag className="h-3 w-3" />
            KAMPANYE STRATEGIS
          </span>
          {c.organization_name ? (
            <span className="text-xs font-mono text-slate-500">
              Inisiator: {c.organization_name}
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {c.name}
        </h1>

        {c.description ? (
          <p className="text-sm text-slate-600 leading-relaxed">
            {c.description}
          </p>
        ) : null}
      </div>

      {/* Target Progress Meter */}
      {c.target_value ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Capaian Target Terverifikasi
            </span>
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200/60">
              {pct}% TERCAPAI
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-slate-600">
              <span className="font-bold text-slate-900">
                {c.current.toLocaleString("id-ID")} kg terkumpul
              </span>
              <span>Target: {c.target_value.toLocaleString("id-ID")} kg</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {c.participants} Relawan Bergabung
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {c.actions} Aksi Lolos Verifikasi
            </span>
          </div>
        </div>
      ) : null}

      {/* Missions in this campaign */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          Misi Lapangan dalam Kampanye Ini
        </h2>

        <div className="space-y-2.5">
          {c.missions.map((m) => (
            <div
              key={m.slug}
              className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-2xs"
            >
              <div className="space-y-1">
                <Link
                  href={`/missions/${m.slug}`}
                  className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                >
                  {m.title}
                </Link>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} />
                </div>
              </div>

              <Link
                href={`/missions/${m.slug}`}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <span>Buka Misi</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Pool Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-xs text-slate-600">
        <ShieldAlert className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Demo reward pool{" "}
          {c.demo_reward_pool
            ? `Rp ${(c.demo_reward_pool as number).toLocaleString("id-ID")}`
            : ""}{" "}
          bersifat simulasi alokasi sponsor untuk keperluan kompetisi dan bukan merupakan transaksi perbankan riil.
        </p>
      </div>
    </div>
  );
}
