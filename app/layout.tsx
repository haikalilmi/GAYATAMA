import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "./(auth)/actions";

export const metadata: Metadata = {
  title: "ImpactQuest",
  description:
    "Complete verified social missions and track the impact you create.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              ImpactQuest
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
              <Link href="/missions">Misi</Link>
              <Link href="/community">Komunitas</Link>
              <Link href="/leaderboard">Board</Link>
              <Link href="/rewards">Reward</Link>
              {user ? (
                <>
                  <Link href="/my-missions">Misi Saya</Link>
                  <Link href="/portfolio">Portfolio</Link>
                  <Link href="/notifications">Notif</Link>
                </>
              ) : null}
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/admin">Admin</Link>
              {user ? (
                <>
                  <span className="text-slate-500">
                    {user.full_name} · {user.role}
                  </span>
                  <form action={logoutAction}>
                    <button type="submit" className="underline">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/register">Daftar</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
