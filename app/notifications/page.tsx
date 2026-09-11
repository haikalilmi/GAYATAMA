import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/impact";
import { markReadAction } from "./actions";

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const rows = await listNotifications(user.id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifikasi</h1>
        {rows.some((r) => !r.is_read) ? (
          <form action={markReadAction}>
            <button type="submit" className="text-sm underline">Tandai dibaca</button>
          </form>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="rounded border bg-white p-6 text-center text-sm text-slate-500">Belum ada notifikasi.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={n.id} className={`rounded border bg-white p-3 text-sm ${!n.is_read ? "border-slate-900" : ""}`}>
              <p className="font-medium">{n.title}</p>
              <p className="text-slate-600">{n.message}</p>
              <p className="text-xs text-slate-500">{n.type} · {new Date(n.created_at).toLocaleString("id-ID")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
