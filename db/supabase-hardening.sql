-- Run using a database owner in the Supabase SQL editor.
-- Preserve server access; generic SQL must never be callable by browser roles.
DO $hardening$
BEGIN
  GRANT EXECUTE ON FUNCTION public.exec_sql(text, jsonb) TO service_role;
  REVOKE EXECUTE ON FUNCTION public.exec_sql(text, jsonb) FROM PUBLIC, anon, authenticated;
END
$hardening$;
