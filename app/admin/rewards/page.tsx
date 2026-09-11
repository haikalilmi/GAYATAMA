import Link from "next/link";
import { listAllRewards } from "@/lib/rewards-admin";

export default async function AdminRewardsPage() {
  const rows = await listAllRewards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kelola Reward ({rows.length})</h1>
        <Link href="/admin/rewards/new" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          + Reward baru
        </Link>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="px-3 py-2">Judul</th>
              <th className="px-3 py-2">Biaya</th>
              <th className="px-3 py-2">Stok</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Link href={`/admin/rewards/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.point_cost} poin</td>
                <td className="px-3 py-2">{r.stock}</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
