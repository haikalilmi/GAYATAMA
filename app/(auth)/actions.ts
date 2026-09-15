"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sql } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").max(255),
  password: z.string().min(4, "Password must be at least 4 characters.").max(128),
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
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const email = parsed.data.email.toLowerCase();
  if (!email.includes("@")) return { error: "Invalid email." };
  const row = await sql<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = ?",
    email
  ).get();
  if (!row || !verifyPassword(parsed.data.password, row.password_hash)) {
    return { error: "Incorrect email or password." };
  }
  await createSession(row.id);
  redirect(safeNext(form.get("next")));
}

const registerSchema = credentialsSchema.extend({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
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
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const email = parsed.data.email.toLowerCase();
  if (!email.includes("@")) return { error: "Invalid email." };
  const exists = await sql("SELECT 1 FROM users WHERE email = ?", email).get();
  if (exists) return { error: "Email is already registered. Please sign in." };
  const id = crypto.randomUUID();
  // Role selalu USER. Client tidak boleh tentukan role.
  await sql(
    "INSERT INTO users (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, 'USER')",
    id, email, parsed.data.full_name, hashPassword(parsed.data.password)
  ).run();
  await createSession(id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
