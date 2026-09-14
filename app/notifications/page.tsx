import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/impact";
import { markReadAction } from "./actions";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Sparkles,
  CheckCheck,
} from "lucide-react";

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const rows = await listNotifications(user.id);
  const unreadCount = rows.filter((r) => !r.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-enter-tactile">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60">
              <Bell className="h-3 w-3" />
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-mono font-bold text-rose-700 border border-rose-200/60">
                {unreadCount} BARU
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Notifikasi & Sinyal Aksi
          </h1>
          <p className="text-sm text-slate-500">
            Pembaruan hasil verifikasi misi, kenaikan level, dan reward.
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markReadAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5 text-sky-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
          </form>
        )}
      </div>

      {/* Notifications List */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <Bell className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-base font-semibold text-slate-800">
            Belum ada notifikasi
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sinyal pembaruan akan masuk setelah kamu mengirimkan bukti aksi lapangan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((n) => {
            const isApproved = n.type.includes("APPROVED");
            const isRejected =
              n.type.includes("REJECTED") || n.type.includes("REVISION");
            const isReward = n.type.includes("REWARD");
            const isLevel = n.type.includes("LEVEL");

            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 sm:p-5 shadow-rim transition-all ${
                  !n.is_read
                    ? "border-sky-300/80 bg-sky-50/20 ring-1 ring-sky-500/10"
                    : "border-slate-200/80 bg-white"
                }`}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isApproved
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : isRejected
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : isReward
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : isLevel
                            ? "bg-purple-50 text-purple-600 border border-purple-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isRejected ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : isReward ? (
                    <Gift className="h-4 w-4" />
                  ) : isLevel ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {n.title}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{n.type}</span>
                    <span>{new Date(n.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
