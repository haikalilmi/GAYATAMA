import { scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export const SESSION_COOKIE = "iq_session";
const SESSION_DAYS = 30;

export type UserRole = "USER" | "ADMIN" | "ORGANIZATION";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  total_xp: number;
  points_balance: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const input = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return input.length === expected.length && timingSafeEqual(input, expected);
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const id = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(
    id,
    userId,
    expires.toISOString()
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.full_name, u.role, u.total_xp, u.points_balance, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`
    )
    .get(sid) as
    | (SessionUser & { expires_at: string })
    | undefined;
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    total_xp: row.total_xp,
    points_balance: row.points_balance,
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (sid) {
    try {
      getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sid);
    } catch {
      // abaikan, cookie tetap dihapus
    }
  }
  jar.delete(SESSION_COOKIE);
}

export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
