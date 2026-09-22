import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { isSupabaseMode } from "@/lib/mode";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Google OAuth hanya tersedia di mode Supabase; mode dummy pakai akun lokal.
  if (!isSupabaseMode()) {
    return NextResponse.redirect(`${origin}/login`);
  }
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  // Create a Supabase server client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );

  // Exchange the code for a Supabase session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supaUser = data.user;
  const email = supaUser.email?.toLowerCase();
  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=no_email`);
  }

  const fullName =
    supaUser.user_metadata?.full_name ??
    supaUser.user_metadata?.name ??
    email.split("@")[0] ??
    "User";

  // Upsert user into our custom users table
  const existing = await sql<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    email
  ).get();

  let userId: string;

  if (existing) {
    userId = existing.id;
    // Update name if changed
    await sql(
      "UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?",
      fullName,
      new Date().toISOString(),
      userId
    ).run();
  } else {
    // Create new user
    userId = crypto.randomUUID();
    const now = new Date().toISOString();
    await sql(
      `INSERT INTO users (id, email, full_name, password_hash, role, total_xp, points_balance, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'USER', 0, 0, ?, ?)`,
      userId,
      email,
      fullName,
      "oauth:google", // No password for OAuth users
      now,
      now
    ).run();
  }

  // Create our app session cookie
  await createSession(userId);

  return NextResponse.redirect(`${origin}${next}`);
}
