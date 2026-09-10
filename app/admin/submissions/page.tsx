import Link from "next/link";
import { listMissionsForFilter, listSubmissions, parseQueueFilter } from "@/lib/admin";

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "flagged", label: "Risiko tinggi" },
  { key: "revision", label: "Revisi" },
  { key: "approved", label: "Disetujui" },
  { key: "rejected", label: "Ditolak" },
  { key: "all", label: "Semua" },
] as const;

export default async function SubmissionQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = parseQueueFilter(sp);
  const rows = listSubmissions(filter);
  const missions = listMissionsForFilter();
  const tab = filter.tab ?? "pending";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Antrian Submission</h1>

      <nav className="flex flex-wrap gap-2 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={{ pathname: "/admin/submissions", query: { ...sp, tab: t.key } }}
            className={`rounded px-3 py-1.5 ${tab === t.key ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="tab" value={tab} />
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs font-medium text-slate-500">Cari user/misi</label>
          <input id="q" name="q" type="search" defaultValue={filter.q ?? ""} maxLength={100}
            className="rounded border bg-white px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="mission" className="text-xs font-medium text-slate-500">Misi</label>
          <select id="mission" name="mission" defaultValue={filter.mission ?? "ALL"}
            className="rounded border bg-white px-2 py-1.5 text-sm">
            <option value="ALL">Semua</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="risk" className="text-xs font-medium text-slate-500">Risiko</label>
          <select id="risk" name="risk" defaultValue={filter.risk ?? "ALL"}
            className="rounded border bg-white px-2 py-1.5 text-sm">
            <option value="ALL">Semua</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <button type="submit" className="rounded bg-slate-900 px-4 py-1.5 text-sm text-white">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded border bg-white p-6 text-center text-sm text-slate-500">Tidak ada submission.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-3 py-2">Misi</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Risiko</th>
                <th className="px-3 py-2">Dikirim</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/admin/submissions/${r.id}`} className="font-medium hover:underline">
                      {r.mission_title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{r.user_name}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.risk_level}({r.risk_score})</td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(r.submitted_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
