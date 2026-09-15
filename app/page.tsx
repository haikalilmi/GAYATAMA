import Link from "next/link";
import { getCommunityImpact } from "@/lib/impact";
import { listMissions } from "@/lib/missions";
import { getCampaigns } from "@/lib/campaigns";
import { getCurrentUser } from "@/lib/auth";
import { FlightHero } from "@/components/flight-hero";
import {
  CheckCircle2,
  Users,
  Recycle,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();
  const impact = await getCommunityImpact();
  const featured = (await listMissions({})).slice(0, 3);
  const campaigns = await getCampaigns();
  const campaign = campaigns[0];

  const wasteCollected =
    impact.metrics.find((m) => m.key === "waste_collected")?.value ?? 0;

  const protocolSteps = [
    {
      num: "01",
      title: "Pick a Field Mission",
      desc: "Browse environment, education, or social actions near you.",
    },
    {
      num: "02",
      title: "Act and Document",
      desc: "Do the work, capture geotagged photo evidence, and record measurable impact metrics.",
    },
    {
      num: "03",
      title: "Multi-Party Verification",
      desc: "Independent reviewers audit the evidence transparently.",
    },
    {
      num: "04",
      title: "Claim XP, Points and Rewards",
      desc: "Climb the impact portfolio ranking and redeem points for sponsor rewards.",
    },
  ];

  return (
    <div className="-mx-4 -mt-6 md:-mx-8 md:-mt-8">
      {/* Hero — fixed fullscreen, shrinks on scroll via internal spacer */}
      <FlightHero
        verifiedActions={impact.verifiedActions}
        contributors={impact.contributors}
        wasteCollected={wasteCollected}
        isLoggedIn={!!user}
      />

      {/* Content layer — positioned directly below the hero card */}
      <div className="relative bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-8 pt-8 pb-16 space-y-12">

      {/* Real Impact Telemetry Grid */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Actions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {impact.verifiedActions.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">100% validated</span> by the verification team
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Contributors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {impact.contributors.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              Volunteers registered across regions
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Waste Handled
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Recycle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {wasteCollected.toLocaleString("en-US")}{" "}
              <span className="text-lg font-sans font-medium text-slate-600">kg</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              Recyclable waste diverted from landfill
            </p>
          </div>
        </div>
      </section>

      {/* Protokol Aksi / Cara Kerja */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/60 pb-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-sky-600 uppercase">
              Flight Plan
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How ImpactQuest Works
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Four structured steps keep every action accountable and on the record.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {protocolSteps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-sky-500/40">
                  {step.num}
                </span>
                <span className="h-2 w-2 rounded-full bg-sky-500" />
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 text-sm">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Misi Unggulan */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-sky-600 uppercase">
              Featured
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Featured Missions Ready to Join
            </h2>
          </div>
          <Link
            href="/missions"
            className="group flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
          >
            <span>View All Missions</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {featured.map((m) => (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                    {m.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{m.difficulty}</span>
                </div>
                <Link
                  href={`/missions/${m.slug}`}
                  className="block font-bold text-slate-900 hover:text-sky-600 transition-colors line-clamp-2"
                >
                  {m.title}
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {m.short_description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 font-mono">+{m.xp_reward} XP</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-sky-700 font-semibold font-mono">+{m.point_reward} Pts</span>
                </div>
                <Link
                  href={`/missions/${m.slug}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-sky-600 hover:text-white transition-colors"
                  aria-label="View mission"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Sponsor Campaign */}
      {campaign && campaign.target_value ? (
        <section className="overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50/80 via-white to-sky-50/50 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Sponsor Impact Pool
                </span>
                <span className="text-xs text-slate-500 font-medium">Active Program</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
            </div>

            <div className="md:text-right space-y-1">
              <p className="text-xs text-slate-500">Target Progress</p>
              <p className="text-xl font-extrabold font-mono text-slate-900">
                {campaign.current.toLocaleString("en-US")}{" "}
                <span className="text-xs font-normal text-slate-500">
                  / {campaign.target_value.toLocaleString("en-US")} kg
                </span>
              </p>
              <p className="text-[11px] text-slate-500">
                {campaign.participants} Participants · {campaign.actions} Field Actions
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-200/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-sky-600 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((campaign.current / campaign.target_value) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0 kg</span>
              <span className="font-semibold text-slate-700">
                {Math.min(
                  100,
                  Math.round((campaign.current / campaign.target_value) * 100)
                )}% Achieved
              </span>
              <span>{campaign.target_value.toLocaleString("en-US")} kg</span>
            </div>
          </div>
        </section>
      ) : null}

      {/* Anti-Slop Trust Framework / Keamanan Bukti */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Anti-Fraud and Geotagging</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Photo evidence is audited using location metadata, timestamps, and anomaly detection to prevent duplicate submissions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Multi-Party Verification</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Human reviewers check evidence objectively before XP and points are released.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Audit-Ready Portfolio</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your contribution history can be exported and shared as proof of social impact for school or career.
              </p>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
