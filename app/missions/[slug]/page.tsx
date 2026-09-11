import Link from "next/link";
import { notFound } from "next/navigation";
import { getMissionBySlug } from "@/lib/missions";
import { getCurrentUser } from "@/lib/auth";
import { getUserParticipation } from "@/lib/participation";
import { JoinForm } from "./join-form";

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = await getMissionBySlug(slug);
  if (!mission) notFound();
  const user = await getCurrentUser();

  const evidence: string[] = [];
  if (mission.requires_before_photo) evidence.push("Foto sebelum");
  if (mission.requires_after_photo) evidence.push("Foto sesudah");
  if (mission.requires_description) evidence.push("Deskripsi kegiatan");
  if (mission.requires_proof_code) evidence.push("Kode bukti partisipasi");
  if (mission.requires_partner_code) evidence.push("Kode partner/acara");

  let sdg: string[] = [];
  try {
    sdg = JSON.parse(mission.sdg_codes) as string[];
  } catch {
    sdg = [];
  }

  return (
    <div className="space-y-6">
      <Link href="/missions" className="text-sm underline">
        ← Semua misi
      </Link>
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          {mission.category} · {mission.difficulty} · {mission.mission_type}
        </p>
        <h1 className="text-2xl font-bold">{mission.title}</h1>
        <p className="text-slate-600">{mission.description}</p>
        <p className="font-medium">
          +{mission.xp_reward} XP · +{mission.point_reward} Impact Points
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Bukti wajib</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            Gambar JPG/PNG/WEBP, maks 5 MB per file. Batas submit {mission.participation_expiry_hours} jam
            setelah join.
          </p>
        </div>
        <div className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Dampak terukur</h2>
          {mission.metrics.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada metrik.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {mission.metrics.map((m) => (
                <li key={m.metric_key}>
                  {m.name} ({m.unit})
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-500">
            Pengulangan: {mission.repeat_type}
            {sdg.length > 0 ? ` · SDG ${sdg.join(", ")}` : ""}
          </p>
        </div>
      </div>

      {user ? (
        await (async () => {
          const part = await getUserParticipation(user.id, mission.id);
          if (part) {
            const expired = new Date(part.expires_at) < new Date();
            return (
              <div className="rounded border bg-white p-4 text-sm space-y-1">
                <p className="font-semibold">Kamu sudah ikut misi ini ({part.status}).</p>
                <p>
                  Kode bukti: <span className="font-mono font-bold">{part.proof_code}</span>
                </p>
                <p className="text-slate-600">
                  Batas submit: {new Date(part.expires_at).toLocaleString("id-ID")}
                  {expired ? " (kedaluwarsa)" : ""}
                </p>
                <p className="text-slate-500">Simpan kode ini untuk submit bukti (Milestone 8).</p>
              </div>
            );
          }
          if (user.role !== "USER") {
            return (
              <p className="rounded border bg-white p-4 text-sm text-slate-600">
                Akun {user.role} tidak bisa ikut misi.
              </p>
            );
          }
          return <JoinForm missionId={mission.id} slug={mission.slug} />;
        })()
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(`/missions/${mission.slug}`)}`}
          className="inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Login untuk ikut misi
        </Link>
      )}
    </div>
  );
}
