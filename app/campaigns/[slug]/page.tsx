import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/campaigns";

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCampaignBySlug(slug);
  if (!c) notFound();
  const pct = c.target_value ? Math.min(100, Math.round((c.current / c.target_value) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Campaign demo{c.organization_name ? ` · ${c.organization_name}` : ""}</p>
        <h1 className="text-2xl font-bold">{c.name}</h1>
        {c.description ? <p className="text-slate-600">{c.description}</p> : null}
      </div>

      {c.target_value ? (
        <div className="rounded border bg-white p-4 space-y-2">
          <p className="font-medium">
            {c.current.toLocaleString("id-ID")} / {c.target_value.toLocaleString("id-ID")} kg ({pct}%)
          </p>
          <div className="h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-green-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-slate-500">
            {c.participants} partisipan · {c.actions} aksi terverifikasi. Hanya dampak verified yang dihitung.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className="font-semibold">Misi dalam campaign</h2>
        <ul className="space-y-2">
          {c.missions.map((m) => (
            <li key={m.slug} className="rounded border bg-white p-3 text-sm">
              <Link href={`/missions/${m.slug}`} className="font-medium hover:underline">{m.title}</Link>{" "}
              <span className="text-slate-500">· {m.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
        Demo reward pool{c.demo_reward_pool ? ` ${(c.demo_reward_pool as number).toLocaleString("id-ID")}` : ""}, bukan dana nyata.
      </p>
    </div>
  );
}
