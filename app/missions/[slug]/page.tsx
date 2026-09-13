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
      label: "Foto Kondisi Sebelum",
      icon: Camera,
      desc: "Foto area sebelum aksi dilakukan untuk validasi baseline.",
    });
  if (mission.requires_after_photo)
    evidence.push({
      label: "Foto Kondisi Sesudah",
      icon: Camera,
      desc: "Foto hasil akhir aksi nyata dengan sudut serupa.",
    });
  if (mission.requires_description)
    evidence.push({
      label: "Catatan Lapangan & Deskripsi",
      icon: FileText,
      desc: "Laporan ringkas mengenai langkah aksi yang diambil.",
    });
  if (mission.requires_proof_code)
    evidence.push({
      label: "Kertas / Tanda Kode Bukti",
      icon: KeyRound,
      desc: "Wajib menyertakan kode unik saat pengambilan dokumentasi.",
    });
  if (mission.requires_partner_code)
    evidence.push({
      label: "Kode Partner / Acara",
      icon: KeyRound,
      desc: "Kode khusus dari koordinator kegiatan atau sponsor.",
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
        <span>Kembali ke Direktori Misi</span>
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
              Tipe: {mission.mission_type}
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

        {/* Telemetry Reward Callout */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reward Terverifikasi:
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sky-700 border border-slate-200 shadow-2xs">
              <Sparkles className="h-4 w-4 text-sky-600" />
              +{mission.xp_reward.toLocaleString("id-ID")} XP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-amber-700 border border-slate-200 shadow-2xs">
              <Award className="h-4 w-4 text-amber-600" />
              +{mission.point_reward.toLocaleString("id-ID")} Impact Points
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Bukti Wajib & Dampak Terukur */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Bukti Wajib */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Protokol Bukti Wajib
            </h2>
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
            Format: JPG/PNG/WEBP (Maks 5 MB). Masa unggah:{" "}
            <span className="font-bold text-slate-700">
              {mission.participation_expiry_hours} jam
            </span>{" "}
            sejak konfirmasi slot.
          </div>
        </div>

        {/* Dampak Terukur */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Metrik Dampak Terukur
            </h2>
          </div>

          {mission.metrics.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada metrik numerik khusus untuk misi ini.
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
                    Satuan: {m.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
            Frekuensi Aksi:{" "}
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
                      Kamu sudah ikut misi ini
                    </h3>
                  </div>

                  <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Kode bukti:
                        </span>
                        <p className="font-mono text-2xl font-black text-sky-900 tracking-wider">
                          {part.proof_code}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Batas Waktu Submit:
                        </span>
                        <p
                          className={`font-mono text-xs font-bold ${
                            expired ? "text-rose-600" : "text-slate-800"
                          }`}
                        >
                          {new Date(part.expires_at).toLocaleString("id-ID")}
                          {expired ? " (Kedaluwarsa)" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Tuliskan kode di atas pada kertas dan sertakan saat mengambil foto aksi nyata di lapangan.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                      href="/my-missions"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Buka di Misi Saya
                    </Link>
                    {!expired && part.status === "JOINED" ? (
                      <Link
                        href={`/my-missions/${part.id}/submit`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <span>Unggah Bukti Aksi</span>
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
                    Akun bertipe <span className="font-mono font-bold">{user.role}</span> hanya bertindak sebagai pengelola atau verifikator dan tidak dapat mendaftar misi lapangan.
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Siap Mengambil Aksi Ini?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik tombol di bawah untuk memesan slot verifikasi dan mendapatkan kode unik partisipasi.
                  </p>
                </div>
                <JoinForm missionId={mission.id} slug={mission.slug} />
              </div>
            );
          })()
        ) : (
          <div className="text-center py-4 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              Masuk untuk Mengikuti Misi Ini
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Daftarkan diri atau masuk dengan akun Google / demo untuk mencatat dampak sosialmu.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/missions/${mission.slug}`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Login untuk Ikut Misi</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
