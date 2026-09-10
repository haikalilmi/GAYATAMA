"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").max(255),
  password: z.string().min(4, "Password minimal 4 karakter.").max(128),
});

export interface AuthState {
  error: string;
}

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function loginAction(
  _prev: AuthState | null,
  form: FormData
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  const email = parsed.data.email.toLowerCase();
  if (!email.includes("@")) return { error: "Email tidak valid." };
  const row = getDb()
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as { id: string; password_hash: string } | undefined;
  if (!row || !verifyPassword(parsed.data.password, row.password_hash)) {
    return { error: "Email atau password salah." };
  }
  await createSession(row.id);
  redirect(safeNext(form.get("next")));
}

const registerSchema = credentialsSchema.extend({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
});

export async function registerAction(
  _prev: AuthState | null,
  form: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    full_name: form.get("full_name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  const email = parsed.data.email.toLowerCase();
  if (!email.includes("@")) return { error: "Email tidak valid." };
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
  if (exists) return { error: "Email sudah terdaftar. Silakan login." };
  const id = crypto.randomUUID();
  // Role selalu USER. Client tidak boleh tentukan role.
  db.prepare(
    "INSERT INTO users (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, 'USER')"
  ).run(id, email, parsed.data.full_name, hashPassword(parsed.data.password));
  await createSession(id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
