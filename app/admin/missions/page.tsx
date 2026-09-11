import Link from "next/link";
import { listAllMissions, statusActions } from "@/lib/missions";
import { StatusButtons } from "./form";

export default async function AdminMissionsPage() {
  const rows = await listAllMissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kelola Misi ({rows.length})</h1>
        <Link href="/admin/missions/new" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          + Misi baru
        </Link>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="px-3 py-2">Judul</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Reward</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Link href={`/admin/missions/${m.id}`} className="font-medium hover:underline">
                    {m.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{m.category}</td>
                <td className="px-3 py-2">+{m.xp_reward} XP · +{m.point_reward}</td>
                <td className="px-3 py-2">{m.status}</td>
                <td className="px-3 py-2">
                  <StatusButtons missionId={m.id} actions={statusActions(m.status).map((a) => a)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
