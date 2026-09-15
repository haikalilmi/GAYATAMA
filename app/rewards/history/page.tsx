import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRedemptions } from "@/lib/rewards";
import {
  ArrowLeft,
  Ticket,
  CheckCircle2,
} from "lucide-react";

export default async function RewardHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await requireUser("/rewards/history");
  const { code } = await searchParams;
  const rows = await listRedemptions(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-enter-tactile">
      {/* Back Link */}
      <Link
        href="/rewards"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Reward Catalog</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reward Redemption History
          </h1>
          <p className="text-sm text-slate-500">
            Demo vouchers and merchandise you have redeemed.
          </p>
        </div>
      </div>

      {/* Success Notification Banner if newly redeemed */}
      {code ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-rim space-y-2"
        >
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="font-bold text-sm">Points Redeemed Successfully!</p>
          </div>
          <p className="text-xs text-emerald-700">
            Save the demo code below to show to the organizers or sponsor merchant:
          </p>
          <div className="rounded-xl border border-emerald-300 bg-white p-3 text-center space-y-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              Your demo code:
            </span>
            <span className="font-mono text-xl font-black text-emerald-900 tracking-wider block">
              {code}
            </span>
          </div>
        </div>
      ) : null}

      {/* History List */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <Ticket className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="mt-3 text-base font-semibold text-slate-800">
            No reward redemptions yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Collect Impact Points by completing verified social missions.
          </p>
          <Link
            href="/rewards"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <span>Open Reward Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const isJustRedeemed = code === r.demo_code;
            return (
              <div
                key={r.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-rim transition-all ${
                  isJustRedeemed
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/80"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      -{r.point_cost} PTS
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(r.created_at).toLocaleString("en-US")}
                    </span>
                  </div>
                  <p className="font-bold text-base text-slate-900">
                    {r.reward_title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Status: Verified Simulation Ledger
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Demo Code:
                  </span>
                  <span className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-1 font-mono text-sm font-black text-slate-800">
                    {r.demo_code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
