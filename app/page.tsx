import Link from "next/link";
import { getCommunityImpact } from "@/lib/impact";
import { listMissions } from "@/lib/missions";
import { getCampaigns } from "@/lib/campaigns";

export default async function Home() {
  const impact = getCommunityImpact();
  const featured = listMissions({}).slice(0, 3);
  const campaigns = getCampaigns();
  const campaign = campaigns[0];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-sm text-slate-500">Prototype lomba, data lokal</p>
        <h1 className="text-3xl font-bold">Turn Good Actions Into Measurable Impact</h1>
        <p className="max-w-xl text-slate-600">
          Join verified social missions, earn recognition and rewards, and build your social impact portfolio.
        </p>
        <div className="flex gap-3">
          <Link href="/missions" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Jelajahi misi
          </Link>
          <Link href="/register" className="rounded border px-4 py-2 text-sm">
            Daftar gratis
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Aksi terverifikasi</p>
          <p className="text-2xl font-bold">{impact.verifiedActions.toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Kontributor</p>
          <p className="text-2xl font-bold">{impact.contributors.toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Sampah terkumpul</p>
          <p className="text-2xl font-bold">
            {(impact.metrics.find((m) => m.key === "waste_collected")?.value ?? 0).toLocaleString("id-ID")} kg
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Cara kerja</h2>
        <ol className="grid gap-3 sm:grid-cols-4 text-sm">
          {["Pilih dan ikuti misi", "Lakukan aksi + submit bukti", "Terverifikasi manusia", "Dapat XP, badge, reward"].map(
            (s, i) => (
              <li key={s} className="rounded border bg-white p-3">
                <span className="font-bold">{i + 1}. </span>
                {s}
              </li>
            )
          )}
        </ol>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Misi unggulan</h2>
          <Link href="/missions" className="text-sm underline">Semua</Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {featured.map((m) => (
            <li key={m.id} className="rounded border bg-white p-4 text-sm space-y-1">
              <Link href={`/missions/${m.slug}`} className="font-semibold hover:underline">{m.title}</Link>
              <p className="text-slate-500">+{m.xp_reward} XP · +{m.point_reward} poin</p>
            </li>
          ))}
        </ul>
      </section>

      {campaign && campaign.target_value ? (
        <section className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">{campaign.name} (demo sponsor)</h2>
          <p className="text-sm text-slate-600">{campaign.description}</p>
          <p className="text-sm">
            {campaign.current.toLocaleString("id-ID")} / {campaign.target_value.toLocaleString("id-ID")} kg ·{" "}
            {campaign.participants} partisipan · {campaign.actions} aksi
          </p>
          <div className="h-2 rounded bg-slate-100">
            <div
              className="h-2 rounded bg-green-700"
              style={{ width: `${Math.min(100, Math.round((campaign.current / campaign.target_value) * 100))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">Demo reward pool, bukan dana nyata.</p>
        </section>
      ) : null}
    </div>
  );
}
