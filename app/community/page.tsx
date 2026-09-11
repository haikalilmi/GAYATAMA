import { getCommunityImpact } from "@/lib/impact";

export default async function CommunityPage() {
  const c = await getCommunityImpact();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dampak Komunitas</h1>
        <p className="text-sm text-slate-500">Agregat terverifikasi + data demonstrasi.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Aksi terverifikasi</p>
          <p className="text-2xl font-bold">{c.verifiedActions.toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Kontributor</p>
          <p className="text-2xl font-bold">{c.contributors.toLocaleString("id-ID")}</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {c.metrics.map((m) => (
          <li key={m.key} className="rounded border bg-white p-4">
            <p className="text-sm text-slate-500">{m.label}</p>
            <p className="text-xl font-bold">{m.value.toLocaleString("id-ID")}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        Angka dasar adalah demonstration data. Aksi prototype terverifikasi ditambahkan di atasnya dan ikut mengubah total.
      </p>
    </div>
  );
}
