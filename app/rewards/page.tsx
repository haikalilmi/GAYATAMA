import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listRewards } from "@/lib/rewards";
import { RedeemButton } from "./redeem-button";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const rewards = await listRewards();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Reward</h1>
        <p className="text-sm text-slate-500">
          Saldo: {user ? `${user.points_balance} Impact Points` : "login untuk tukar"}.
        </p>
      </div>

      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
        Prototype Simulation. Rewards displayed in this prototype do not represent real financial transactions.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {rewards.map((r) => {
          const afford = user && user.points_balance >= r.point_cost;
          return (
            <li key={r.id} className="space-y-2 rounded border bg-white p-4">
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-slate-600">{r.description}</p>
              <p className="text-sm font-medium">
                {r.point_cost} poin · stok {r.stock}
              </p>
              {!user ? (
                <Link href="/login?next=%2Frewards" className="block rounded bg-slate-900 px-4 py-2 text-center text-sm text-white">
                  Login untuk tukar
                </Link>
              ) : r.stock <= 0 ? (
                <p className="text-sm text-slate-500">Stok habis.</p>
              ) : !afford ? (
                <p className="text-sm text-slate-500">Poin belum cukup.</p>
              ) : (
                <RedeemButton rewardId={r.id} disabled={false} />
              )}
            </li>
          );
        })}
      </ul>

      {user ? (
        <Link href="/rewards/history" className="text-sm underline">
          Riwayat penukaran
        </Link>
      ) : null}
    </div>
  );
}
