import { MissionForm } from "../form";

export default async function NewMissionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Misi Baru</h1>
      <p className="text-sm text-slate-500">Misi baru selalu mulai sebagai DRAFT, tersembunyi dari user.</p>
      <MissionForm mode="create" />
    </div>
  );
}
