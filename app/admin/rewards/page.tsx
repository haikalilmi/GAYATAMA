import Link from "next/link";
import { listAllRewards } from "@/lib/rewards-admin";
import { StatusBadge } from "@/components/ui/status-badge";
import { Gift, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const rows = await listAllRewards();

  return (
    <div className="space-y-6 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
              <Gift className="h-3 w-3" />
              Stok Reward
            </span>
            <span className="text-xs font-mono text-slate-400">
              {rows.length} ITEM REWARD
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Kelola Stok Reward
          </h1>
          <p className="text-sm text-slate-500">
            Atur katalog voucher sponsor, harga penukaran poin, dan batas kuota stok.
          </p>
        </div>

        <Link
          href="/admin/rewards/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Reward Baru</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-rim">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Nama Reward</th>
                <th className="px-5 py-3.5">Biaya Poin</th>
                <th className="px-5 py-3.5">Stok Tersedia</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    <Link
                      href={`/admin/rewards/${r.id}`}
                      className="hover:text-sky-600 transition-colors"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-amber-700">
                    {r.point_cost.toLocaleString("id-ID")} PTS
                  </td>
                  <td className="px-5 py-4 font-mono">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 font-bold ${
                        r.stock <= 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {r.stock} slot
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
