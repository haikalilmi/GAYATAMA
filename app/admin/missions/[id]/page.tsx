import Link from "next/link";
import { getMissionForAdmin } from "@/lib/missions";
import { MissionForm } from "../form";

export default async function EditMissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = await getMissionForAdmin(id);
  if (!mission) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Misi tidak ketemu.</h1>
        <Link href="/admin/missions" className="text-sm underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Edit: {mission.title}</h1>
        <p className="text-sm text-slate-500">/{mission.slug} · {mission.status}</p>
      </div>
      <MissionForm mode="edit" missionId={mission.id} initial={mission} />
      <Link href="/admin/missions" className="text-sm underline">Kembali ke daftar</Link>
    </div>
  );
}
