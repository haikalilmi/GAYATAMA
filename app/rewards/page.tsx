import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listRewards } from "@/lib/rewards";
import { RedeemButton } from "./redeem-button";
import { Gift, Coins, History, ArrowRight, ShieldAlert } from "lucide-react";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const rewards = await listRewards();

  return (
    <div className="space-y-8 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
              <Gift className="h-3 w-3" />
              IMPACT EXCHANGE
            </span>
            <span className="text-xs font-mono text-slate-400">
              KATALOG REWARD SIMULASI
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Katalog Reward Sponsor
          </h1>
          <p className="text-sm text-slate-500">
            Tukarkan akumulasi Impact Points yang kamu peroleh dari aksi sosial terverifikasi.
          </p>
        </div>

        {user ? (
          <Link
            href="/rewards/history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <History className="h-4 w-4 text-slate-500" />
            <span>Riwayat Penukaran</span>
          </Link>
        ) : null}
      </div>

      {/* Points Balance Card & Simulation Notice */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saldo Poin Kamu
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-3xl font-black tracking-tight text-slate-900">
              {user ? user.points_balance.toLocaleString("id-ID") : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {user ? "Impact Points siap ditukarkan" : "Silakan masuk untuk memeriksa saldo"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 sm:col-span-2 text-xs text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-amber-900">
              Informasi Simulasi Prototipe (Demonstration Mode)
            </p>
            <p className="leading-relaxed text-amber-800">
              Seluruh merchandise, voucher kopi, dan reward yang tercantum pada platform ini bersifat simulasi kompetisi. Transaksi penukaran poin tidak memotong dana finansial nyata dan kode voucher yang dihasilkan adalah kode demonstrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Catalog Grid */}
      <ul className="grid gap-5 sm:grid-cols-2 list-none p-0 m-0">
        {rewards.map((r) => {
          const afford = user && user.points_balance >= r.point_cost;
          const outOfStock = r.stock <= 0;
          return (
            <li
              key={r.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-rim transition-all duration-200 hover:-translate-y-0.5 hover:shadow-rim-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-medium border ${
                      outOfStock
                        ? "bg-slate-100 text-slate-500 border-slate-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                    }`}
                  >
                    {outOfStock ? "Stok Habis" : `Tersedia: ${r.stock} slot`}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {r.point_cost.toLocaleString("id-ID")} PTS
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                  {r.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {!user ? (
                  <Link
                    href="/login?next=%2Frewards"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <span>Login untuk Menukar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : outOfStock ? (
                  <div className="rounded-xl bg-slate-100 p-2.5 text-center text-xs font-semibold text-slate-400">
                    Stok Reward Ini Telah Habis
                  </div>
                ) : !afford ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2.5 text-center text-xs font-mono text-slate-500">
                    Poin belum cukup (butuh {(r.point_cost - user.points_balance).toLocaleString("id-ID")} poin lagi)
                  </div>
                ) : (
                  <RedeemButton rewardId={r.id} disabled={false} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
