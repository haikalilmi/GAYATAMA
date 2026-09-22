// Saklar mode database: Supabase vs lokal SQLite + akun dummy.
// - Juri / dummy: tanpa env Supabase (atau NEXT_PUBLIC_DB_MODE=local) -> SQLite lokal, nol env.
// - Pemilik: isi env Supabase -> otomatis mode Supabase.
// Satu fungsi ini dipakai kode server maupun client (hanya baca NEXT_PUBLIC_*).
export function isSupabaseMode(): boolean {
  const override = process.env.NEXT_PUBLIC_DB_MODE;
  if (override === "local") return false;
  if (override === "supabase") return true;
  if (typeof window === "undefined") {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function isDummyMode(): boolean {
  return !isSupabaseMode();
}
