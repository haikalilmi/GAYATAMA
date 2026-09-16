import Link from "next/link";
import { notFound } from "next/navigation";
import { getMissionBySlug } from "@/lib/missions";
import { getCurrentUser } from "@/lib/auth";
import { getUserParticipation } from "@/lib/participation";
import { JoinForm } from "./join-form";
import {
  ArrowLeft,
  Camera,
  FileText,
  KeyRound,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Layers,
  ArrowRight,
} from "lucide-react";

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = await getMissionBySlug(slug);
  if (!mission) notFound();
  const user = await getCurrentUser();

  const evidence: { label: string; icon: typeof Camera; desc: string }[] = [];
  if (mission.requires_before_photo)
    evidence.push({
      label: "Before Photo",
      icon: Camera,
      desc: "Photo of the area before the action, used to validate the baseline.",
    });
  if (mission.requires_after_photo)
    evidence.push({
      label: "After Photo",
      icon: Camera,
      desc: "Photo of the final result from a similar angle.",
    });
  if (!mission.requires_before_photo && !mission.requires_after_photo)
    evidence.push({
      label: "Action Photo",
      icon: Camera,
      desc: "Photo documenting the action you performed in the field.",
    });
  if (mission.requires_description)
    evidence.push({
      label: "Field Notes and Description",
      icon: FileText,
      desc: "A short report on the steps you took.",
    });
  if (mission.requires_proof_code)
    evidence.push({
      label: "Written Proof Code",
      icon: KeyRound,
      desc: "You must include the unique code in your documentation.",
    });
  if (mission.requires_partner_code)
    evidence.push({
      label: "Partner / Event Code",
      icon: KeyRound,
      desc: "A special code from the event coordinator or sponsor.",
    });

  let sdg: string[] = [];
  try {
    sdg = JSON.parse(mission.sdg_codes) as string[];
  } catch {
    sdg = [];
  }

  return (
    <div className="space-y-8 animate-enter-tactile max-w-4xl">
      {/* Breadcrumb Navigation */}
      <Link
        href="/missions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Mission Directory</span>
      </Link>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200/60">
              {mission.category}
            </span>
            <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 border border-sky-200/60 font-mono">
              Level: {mission.difficulty}
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase">
              Type: {mission.mission_type}
            </span>
          </div>

          {sdg.length > 0 ? (
            <div className="flex items-center gap-1">
              {sdg.map((code) => (
                <span
                  key={code}
                  className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-700 border border-emerald-200/60"
                >
                  SDG {code}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {mission.title}
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Reward Callout */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200/60">
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              What you earn:
            </span>
            <span className="block text-[11px] text-slate-500">
              XP raises your level. Impact Points can be swapped for rewards.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sky-700 border border-slate-200 shadow-2xs">
              <Sparkles className="h-4 w-4 text-sky-600" />
              +{mission.xp_reward.toLocaleString("en-US")} XP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-amber-700 border border-slate-200 shadow-2xs">
              <Award className="h-4 w-4 text-amber-600" />
              +{mission.point_reward.toLocaleString("en-US")} Impact Points
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Required Evidence & Impact */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Required Evidence */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                What you need to prepare
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Bring these with you when you do the mission. You will upload them as proof.
            </p>
          </div>

          <ul className="space-y-3">
            {evidence.map((e) => {
              const Icon = e.icon;
              return (
                <li key={e.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {e.label}
                    </p>
                    <p className="text-xs text-slate-500">{e.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
            Format: JPG/PNG/WEBP (max 5 MB). Upload window:{" "}
            <span className="font-bold text-slate-700">
              {mission.participation_expiry_hours} hours
            </span>{" "}
            after slot confirmation.
          </div>
        </div>

        {/* Dampak Terukur */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                What we count
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              The numbers you report after the mission. A reviewer confirms them before they count.
            </p>
          </div>

          {mission.metrics.length === 0 ? (
            <p className="text-xs text-slate-500">
              No numeric metrics for this mission yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {mission.metrics.map((m) => (
                <li
                  key={m.metric_key}
                  className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3 border border-slate-200/60"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {m.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    Unit: {m.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
            Action Frequency:{" "}
            <span className="font-semibold text-slate-700">
              {mission.repeat_type}
            </span>
          </div>
        </div>
      </div>

      {/* Participation Action Terminal */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-rim">
        {user ? (
          await (async () => {
            const part = await getUserParticipation(user.id, mission.id);
            if (part) {
              const expired = new Date(part.expires_at) < new Date();
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-base text-slate-900">
                      You have joined this mission
                    </h3>
                  </div>

                  <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Your proof code — save this:
                        </span>
                        <p className="font-mono text-2xl font-black text-sky-900 tracking-wider">
                          {part.proof_code}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Send your proof before:
                        </span>
                        <p
                          className={`font-mono text-xs font-bold ${
                            expired ? "text-rose-600" : "text-slate-800"
                          }`}
                        >
                          {new Date(part.expires_at).toLocaleString("en-US")}
                          {expired ? " (Expired)" : ""}
                        </p>
                      </div>
                    </div>
                    <ol className="space-y-1.5 text-xs text-slate-600 leading-relaxed list-decimal pl-5 pt-1 border-t border-sky-200/60">
                      <li>
                        <strong className="text-slate-800">Save this code.</strong> It proves the action is really yours.
                      </li>
                      <li>
                        <strong className="text-slate-800">Do the action.</strong> Write the code on paper and make sure it can be read in your photos.
                      </li>
                      <li>
                        <strong className="text-slate-800">Upload your proof</strong> with the button below, before the deadline.
                      </li>
                    </ol>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                      href="/my-missions"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Open in My Missions
                    </Link>
                    {!expired && part.status === "JOINED" ? (
                      <Link
                        href={`/my-missions/${part.id}/submit`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <span>Upload Action Evidence</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            }
            if (user.role !== "USER") {
              return (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm text-slate-600">
                  <AlertCircle className="h-5 w-5 text-slate-400 shrink-0" />
                  <p>
                    Accounts of type <span className="font-mono font-bold">{user.role}</span> act only as managers or verifiers and cannot join field missions.
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Ready to Take This Action?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click below to reserve a verification slot and get your unique participation code.
                  </p>
                </div>
                <JoinForm missionId={mission.id} slug={mission.slug} />
              </div>
            );
          })()
        ) : (
          <div className="text-center py-4 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              Sign In to Join This Mission
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Sign up or sign in with Google or a demo account to record your social impact.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/missions/${mission.slug}`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Sign In to Join</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
