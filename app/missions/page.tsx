import Link from "next/link";
import {
  categories,
  difficulties,
  listMissions,
  missionTypes,
  parseMissionFilter,
} from "@/lib/missions";

const labels: Record<string, string> = {
  ENVIRONMENT: "Lingkungan",
  EDUCATION: "Edukasi",
  COMMUNITY: "Komunitas",
  DIGITAL: "Digital",
  SOCIAL: "Sosial",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HIGH: "Sulit",
  STANDARD: "Standar",
  LIMITED: "Terbatas",
  SPONSORED: "Sponsor",
};

function Select({
  id,
  name,
  value,
  options,
}: {
  id: string;
  name: string;
  value?: string;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {id === "category" ? "Kategori" : id === "difficulty" ? "Level" : "Tipe"}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value ?? "ALL"}
        className="rounded border bg-white px-2 py-1.5 text-sm"
      >
        <option value="ALL">Semua</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = parseMissionFilter(await searchParams);
  const missions = await listMissions(filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Jelajahi Misi</h1>
        <p className="text-sm text-slate-500">
          Misi aktif yang bisa kamu ikuti dan verifikasi.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <Select id="category" name="category" value={filter.category} options={categories} />
        <Select id="difficulty" name="difficulty" value={filter.difficulty} options={difficulties} />
        <Select id="mission_type" name="mission_type" value={filter.mission_type} options={missionTypes} />
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs font-medium text-slate-500">
            Cari
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filter.q ?? ""}
            placeholder="Nama misi..."
            maxLength={100}
            className="rounded border bg-white px-2 py-1.5 text-sm"
          />
        </div>
        <button type="submit" className="rounded bg-slate-900 px-4 py-1.5 text-sm text-white">
          Filter
        </button>
      </form>

      {missions.length === 0 ? (
        <div className="rounded border bg-white p-6 text-center">
          <p className="font-medium">Tidak ada misi cocok.</p>
          <p className="text-sm text-slate-500">Ubah filter atau kata kunci.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {missions.map((m) => (
            <li key={m.id} className="rounded border bg-white p-4 space-y-2">
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded bg-slate-100 px-2 py-0.5">{labels[m.category]}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">{labels[m.difficulty]}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">{labels[m.mission_type]}</span>
              </div>
              <Link href={`/missions/${m.slug}`} className="font-semibold hover:underline">
                {m.title}
              </Link>
              <p className="text-sm text-slate-600">{m.short_description}</p>
              <p className="text-sm font-medium">
                +{m.xp_reward} XP · +{m.point_reward} poin
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
