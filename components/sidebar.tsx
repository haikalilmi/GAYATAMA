"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Compass,
  Target,
  Users,
  Trophy,
  Gift,
  CheckCircle2,
  Award,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Plane,
  Sparkles,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  user: SessionUser | null;
  logoutAction: () => Promise<void>;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const SHRINK_DISTANCE = 400;
const SIDEBAR_W = 288;

export function Sidebar({ user, logoutAction }: SidebarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const isMd = useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true
  );

  const { scrollY } = useScroll();
  const sidebarX = useTransform(scrollY, [0, SHRINK_DISTANCE], [-SIDEBAR_W, 0], {
    clamp: true,
  });

  const mainNav: NavItem[] = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Explore Missions", href: "/missions", icon: Target },
    { label: "Community", href: "/community", icon: Users },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Reward Catalog", href: "/rewards", icon: Gift },
  ];

  const userNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Missions", href: "/my-missions", icon: CheckCircle2 },
    { label: "Impact Portfolio", href: "/portfolio", icon: Award },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ];

  const isAdmin = user?.role === "ADMIN";

  const manageNav: NavItem[] = isAdmin
    ? [{ label: "Admin Portal", href: "/admin", icon: ShieldCheck, badge: "Admin" }]
    : [];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
            <Plane className="h-5 w-5 -rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">ImpactQuest</span>
            <span className="block text-[10px] font-medium tracking-wider text-sky-600 uppercase">Flight Hub</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open navigation"
            className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-all select-none hover:bg-slate-100 active:scale-[0.98]"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white ${
          !isHome || !isMd
            ? `transition-transform duration-200 ease-out ${
                isOpen
                  ? "translate-x-0 pointer-events-auto"
                  : "-translate-x-full pointer-events-none md:pointer-events-auto md:translate-x-0"
              }`
            : ""
        }`}
        style={
          isHome && isMd
            ? { x: sidebarX }
            : // Selalu definisikan x supaya framer-motion tidak meninggalkan
              // inline style basi saat kondisi berubah (mis. SSR desktop ke mobile).
              { x: 0 }
        }
      >
        {/* Sidebar Header / Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-sky-600 to-blue-700 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Plane className="h-5 w-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 text-lg">ImpactQuest</span>
                <span className="inline-flex items-center rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight">Social Action and Flight Hub</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
          {/* Main Section */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Explore
            </p>
            {mainNav.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-sky-50 text-sky-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? "text-sky-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Specific Section */}
          {user && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                My Activity
              </p>
              {userNav.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-sky-50 text-sky-700 font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? "text-sky-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Management & Admin Section */}
          {manageNav.length > 0 ? (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Manage and Analytics
              </p>
            {manageNav.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-sky-50 text-sky-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? "text-sky-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            </div>
          ) : null}
          {/* Flight Altitude Live Telemetry Mini-Card */}
          <div className="rounded-xl border border-sky-100 bg-linear-to-b from-sky-50/70 to-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs mb-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>Impact Altitude</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Active missions are monitored in real time for transparent verification.
            </p>
          </div>
        </div>

        {/* Sidebar Footer / User Profile or Auth */}
        <div className="border-t border-slate-200 bg-slate-50/70 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-xs text-sm">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.full_name}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-sm bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-800">
                      {user.role}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {user.total_xp} XP
                    </span>
                  </div>
                </div>
              </div>
              <form action={logoutAction} className="pt-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sign Out</span>
                </button>
              </form>
              <ThemeToggle className="w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Start verified social action</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
              <ThemeToggle className="w-full" />
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
