import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listUserParticipations } from "@/lib/participation";
import { CancelButton } from "./cancel-button";

const tabs = [
  { key: "active", label: "Aktif", match: ["JOINED"] },
  { key: "review", label: "Ditinjau", match: ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"] },
  { key: "attention", label: "Perhatian", match: ["REVISION_REQUESTED"] },
  { key: "done", label: "Selesai", match: ["APPROVED", "REJECTED", "CANCELLED", "EXPIRED"] },
] as const;

function remaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "kedaluwarsa";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `sisa ${Math.max(1, Math.floor(ms / 60000))} mnt`;
  if (h < 48) return `sisa ${h} jam`;
  return `sisa ${Math.floor(h / 24)} hari`;
}

export default async function MyMissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser("/my-missions");
  const { tab } = await searchParams;
  const active = tabs.find((t) => t.key === tab) ?? tabs[0];
  const rows = listUserParticipations(user.id).filter((r) =>
    (active.match as readonly string[]).includes(r.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Misi Saya</h1>
        <p className="text-sm text-slate-500">Pantau partisipasi dan batas submit.</p>
      </div>

      <nav className="flex gap-2 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/my-missions?tab=${t.key}`}
            className={`rounded px-3 py-1.5 ${t.key === active.key ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded border bg-white p-6 text-center">
          <p className="font-medium">Kosong.</p>
          <p className="text-sm text-slate-500">
            <Link href="/missions" className="underline">
              Jelajahi misi
            </Link>{" "}
            untuk mulai.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded border bg-white p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/missions/${r.mission_slug}`} className="font-semibold hover:underline">
                  {r.mission_title}
                </Link>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{r.status}</span>
              </div>
              <p className="text-sm text-slate-600">
                Kode: <span className="font-mono font-bold">{r.proof_code}</span> · {remaining(r.expires_at)} (
                {new Date(r.expires_at).toLocaleString("id-ID")})
              </p>
              <div className="flex gap-3 pt-1">
                {r.submission_id ? (
                  <Link href={`/submissions/${r.submission_id}`} className="text-sm underline">
                    Detail
                  </Link>
                ) : null}
                {r.status === "JOINED" ? (
                  <>
                    <Link href={`/my-missions/${r.id}/submit`} className="text-sm underline">
                      Submit bukti
                    </Link>
                    <CancelButton participationId={r.id} />
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
