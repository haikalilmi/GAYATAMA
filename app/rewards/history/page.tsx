import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRedemptions } from "@/lib/rewards";

export default async function RewardHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await requireUser("/rewards/history");
  const { code } = await searchParams;
  const rows = listRedemptions(user.id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Riwayat Reward</h1>
      {code ? (
        <p role="status" className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Berhasil! Kode demo kamu: <span className="font-mono font-bold">{code}</span>
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="rounded border bg-white p-6 text-center text-sm text-slate-500">
          Belum ada penukaran.{" "}
          <Link href="/rewards" className="underline">
            Lihat reward
          </Link>
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded border bg-white p-4 text-sm space-y-1">
              <p className="font-semibold">{r.reward_title} {code === r.demo_code ? "(baru!)" : ""}</p>
              <p className="text-slate-600">
                {r.point_cost} poin · <span className="font-mono">{r.demo_code}</span> ·{" "}
                {new Date(r.created_at).toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">Prototype, bukan transaksi nyata.</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/rewards" className="text-sm underline">
        Kembali ke daftar reward
      </Link>
    </div>
  );
}
