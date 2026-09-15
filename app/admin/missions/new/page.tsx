import { MissionForm } from "../form";

export default async function NewMissionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">New Mission</h1>
      <p className="text-sm text-slate-500">New missions always start as DRAFT, hidden from users.</p>
      <MissionForm mode="create" />
    </div>
  );
}
