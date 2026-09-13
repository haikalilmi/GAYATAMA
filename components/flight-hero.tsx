"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { CloudShader } from "@/components/ui/cloud-shader";
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  Users2,
  Recycle,
  Sparkles,
} from "lucide-react";

interface FlightHeroProps {
  verifiedActions: number;
  contributors: number;
  wasteCollected: number;
  isLoggedIn?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Desktop layout constants                                          */
/* ------------------------------------------------------------------ */
const SHRINK_DISTANCE     = 400;
const SIDEBAR_W           = 288;
const DESKTOP_INSET       = 16;
const DESKTOP_RADIUS      = 24;
const DESKTOP_HERO_HEIGHT = 440;
const GAP_BELOW_HERO      = 20;

export function FlightHero({
  verifiedActions,
  contributors,
  wasteCollected,
  isLoggedIn,
}: FlightHeroProps) {
  /* ---- scroll tracking ------------------------------------------ */
  const { scrollY } = useScroll();

  const [vh, setVh] = useState(800);

  useEffect(() => {
    const updateDimensions = () => {
      setVh(window.innerHeight);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  /* ---- Desktop shrink progress (0 to 1 during first 400px of scroll) ---- */
  const shrinkProgress = useTransform(scrollY, [0, SHRINK_DISTANCE], [0, 1], {
    clamp: true,
  });

  const translateY = useTransform(scrollY, (y) =>
    y > SHRINK_DISTANCE ? -(y - SHRINK_DISTANCE) : 0,
  );

  const clipPath = useTransform(shrinkProgress, (v) => {
    const top    = v * DESKTOP_INSET;
    const right  = v * DESKTOP_INSET;
    const bottom = v * (vh - DESKTOP_INSET - DESKTOP_HERO_HEIGHT);
    const left   = v * (SIDEBAR_W + DESKTOP_INSET);
    const r      = v * DESKTOP_RADIUS;
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px)`;
  });

  const heroTop = useTransform(shrinkProgress, (v) => v * DESKTOP_INSET);
  const heroLeft = useTransform(shrinkProgress, (v) => v * (SIDEBAR_W + DESKTOP_INSET));
  const heroRight = useTransform(shrinkProgress, (v) => v * DESKTOP_INSET);
  const heroBottom = useTransform(
    shrinkProgress,
    (v) => v * (vh - DESKTOP_INSET - DESKTOP_HERO_HEIGHT),
  );

  const contentY       = useTransform(shrinkProgress, [0, 1], [0, -20]);
  const contentOpacity = useTransform(shrinkProgress, [0, 0.6, 1], [1, 0.95, 0.9]);
  const hudY           = useTransform(shrinkProgress, [0, 1], [0, -10]);
  const hudOpacity     = useTransform(shrinkProgress, [0, 0.5, 1], [1, 0.95, 0.9]);
  const statusBarY     = useTransform(shrinkProgress, [0, 1], [0, 0]);
  const wingY          = useTransform(shrinkProgress, [0, 1], [0, 15]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. MOBILE HERO: In normal document flow, 100% native touch  */}
      {/* ============================================================ */}
      <div className="block md:hidden relative w-full overflow-hidden bg-linear-to-t from-[#8cbfe8] to-[#2c6ba8] text-white">
        {/* Background Clouds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-full w-full">
            <CloudShader
              speed={0.7}
              count={3}
              cloudColor="#fbf9f4"
              skyTopColor="#2c6ba8"
              skyBottomColor="#8cbfe8"
              className="absolute inset-0 opacity-80"
            />
          </div>
          <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-white/15 via-transparent to-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-4 pt-4 pb-6 space-y-4">
          {/* Top Flight Status Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-semibold tracking-wide">FLIGHT #IQ-2026</span>
              <span className="text-white/40">|</span>
              <span className="text-white/90">ALT 12,500 FT</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md shadow-xs">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Aksi Terverifikasi</span>
            </div>
          </div>

          {/* Narrative / Copy */}
          <div className="space-y-2 pt-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white [text-shadow:0_2px_12px_rgba(10,35,60,0.45)] leading-snug">
              Turn Good Actions Into Measurable Impact
            </h1>
            <p className="text-xs text-white/90 leading-relaxed [text-shadow:0_1px_4px_rgba(10,35,60,0.3)]">
              Pantau dan jalankan misi kebaikan dari sudut pandang ketinggian. Selesaikan aksi nyata di lapangan, verifikasi bukti secara transparan, dan raih reward berdampak.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link
              href="/missions"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <Compass className="h-3.5 w-3.5 text-sky-600" />
              <span>Jelajahi Misi</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                Buka Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                Daftar Gratis
              </Link>
            )}
          </div>

          {/* Mobile Flight Telemetry HUD */}
          <div className="rounded-xl border border-white/25 bg-slate-950/40 p-3 backdrop-blur-xl shadow-xl text-white space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono font-semibold tracking-wider text-emerald-300 uppercase">
                  FLIGHT TELEMETRY HUD
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/60">
                SECTOR: ID-EARTH
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-white/70">
                  <CheckCircle2 className="h-3 w-3 text-sky-300" />
                  <span>Aksi Selesai</span>
                </div>
                <p className="text-base font-bold font-mono text-white tracking-tight">
                  {verifiedActions.toLocaleString("id-ID")}
                </p>
                <p className="text-[9px] text-white/60">Terverifikasi</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-white/70">
                  <Recycle className="h-3 w-3 text-emerald-300" />
                  <span>Sampah Terpilih</span>
                </div>
                <p className="text-base font-bold font-mono text-white tracking-tight">
                  {wasteCollected.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-sans font-medium text-white/80">kg</span>
                </p>
                <p className="text-[9px] text-white/60">Reduksi limbah</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/70 pt-0.5">
              <span>Relawan: <strong className="font-mono text-white">{contributors.toLocaleString("id-ID")}</strong></span>
              <span className="font-mono text-emerald-300 font-semibold">100% TRANSPARAN</span>
            </div>
          </div>
        </div>

        {/* Wing Graphic at Bottom */}
        <div className="relative overflow-hidden -mt-2">
          <img
            src="https://assets.aceternity.com/components/plane-wing.png"
            alt="Airplane wing above the clouds"
            className="h-24 w-auto object-contain select-none pointer-events-none opacity-85 translate-x-2"
          />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-slate-50 to-transparent" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP HERO: Fixed shrinking runway for large screens    */}
      {/* ============================================================ */}
      <div className="hidden md:block">
        {/* Scroll spacer — drives the shrink runway on desktop */}
        <div
          style={{
            height: `${SHRINK_DISTANCE + DESKTOP_INSET + DESKTOP_HERO_HEIGHT + GAP_BELOW_HERO}px`,
          }}
          aria-hidden="true"
        />

        {/* Hero — fixed inset-0, uses clip-path to visually shrink */}
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            clipPath,
            WebkitClipPath: clipPath,
            y: translateY,
            willChange: "clip-path, transform",
          }}
        >
          {/* ---- Background + Cloud Shader ---- */}
          <div
            className="absolute inset-0 bg-linear-to-t from-[#8cbfe8] to-[#2c6ba8]"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="absolute h-1/2 w-1/2 origin-top-left scale-200">
                <CloudShader
                  speed={0.85}
                  count={5}
                  cloudColor="#fbf9f4"
                  skyTopColor="#2c6ba8"
                  skyBottomColor="#8cbfe8"
                  className="absolute inset-0"
                />
              </div>
            </motion.div>

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_top_right] from-white/15 via-transparent to-black/20" />
          </div>

          {/* ---- Content ---- */}
          <motion.div
            className="absolute z-20"
            style={{
              top: heroTop,
              left: heroLeft,
              right: heroRight,
              bottom: heroBottom,
            }}
          >
            <div className="flex h-full flex-col justify-between px-6 py-5 md:px-10 md:py-8 pointer-events-none">
              {/* Top Flight Status Bar */}
              <motion.div
                className="flex flex-wrap items-center justify-between gap-2"
                style={{ y: statusBarY, opacity: contentOpacity }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-semibold tracking-wide">FLIGHT #IQ-2026</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/90">ALTITUDE 12,500 FT</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Platform Aksi Sosial & Lingkungan Terverifikasi</span>
                </div>
              </motion.div>

              {/* Main Copy + HUD Grid */}
              <div className="my-4 grid gap-6 lg:grid-cols-12 lg:items-center">
                {/* Left — narrative */}
                <motion.div
                  className="lg:col-span-7 space-y-4 pt-2"
                  style={{ y: contentY, opacity: contentOpacity }}
                >
                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl [text-shadow:0_2px_16px_rgba(10,35,60,0.45)] leading-tight">
                    Turn Good Actions Into Measurable Impact
                  </h1>

                  <p className="max-w-xl text-sm sm:text-base text-balance text-white/90 leading-relaxed [text-shadow:0_1px_4px_rgba(10,35,60,0.3)]">
                    Pantau dan jalankan misi kebaikan dari sudut pandang ketinggian.
                    Selesaikan aksi nyata di lapangan, verifikasi bukti dengan
                    transparan, dan raih XP serta reward berdampak.
                  </p>

                  <div className="relative z-30 flex flex-wrap items-center gap-3 pt-1 pointer-events-auto">
                    <Link
                      href="/missions"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:bg-white/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Compass className="h-4 w-4 text-sky-600" />
                      <span>Jelajahi Misi Aktif</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>

                    {isLoggedIn ? (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                      >
                        Buka Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                      >
                        Daftar Gratis
                      </Link>
                    )}
                  </div>
                </motion.div>

                {/* Right — Flight Telemetry HUD */}
                <motion.div
                  className="lg:col-span-5"
                  style={{ y: hudY, opacity: hudOpacity }}
                >
                  <div className="rounded-2xl border border-white/30 bg-slate-950/40 p-4 backdrop-blur-xl shadow-2xl text-white space-y-3">
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-300 uppercase">
                          FLIGHT TELEMETRY HUD
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/60">
                        SECTOR: ID-EARTH
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-300" />
                          <span>Aksi Selesai</span>
                        </div>
                        <p className="text-xl font-bold font-mono text-white tracking-tight">
                          {verifiedActions.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-white/60">Terverifikasi</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <Recycle className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Sampah Terpilih</span>
                        </div>
                        <p className="text-xl font-bold font-mono text-white tracking-tight">
                          {wasteCollected.toLocaleString("id-ID")}{" "}
                          <span className="text-sm font-sans font-medium text-white/80">
                            kg
                          </span>
                        </p>
                        <p className="text-[10px] text-white/60">Reduksi limbah</p>
                      </div>
                    </div>

                    <div className="flex rounded-xl border border-white/10 bg-white/5 p-3 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-200">
                          <Users2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-white/70">Kontributor Aktif</p>
                          <p className="text-base font-bold font-mono text-white">
                            {contributors.toLocaleString("id-ID")} Relawan
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/community"
                        className="text-xs font-semibold text-sky-300 hover:text-white transition-colors underline underline-offset-2 pointer-events-auto"
                      >
                        Lihat &rarr;
                      </Link>
                    </div>

                    <div className="pt-0.5 text-[11px] text-white/70 flex items-center justify-between">
                      <span>Verifikasi Multi-Pihak</span>
                      <span className="font-mono text-emerald-300 font-semibold">
                        100% TRANSPARAN
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Spacer for wing area */}
              <div className="pt-1" />
            </div>

            {/* Wing — positioned at bottom, clipped by parent clip-path */}
            <motion.div
              className="pointer-events-none absolute -bottom-20 md:-bottom-28 left-0 z-10 w-[75%] md:w-[50%]"
              style={{
                y: wingY,
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                <img
                  src="https://assets.aceternity.com/components/plane-wing.png"
                  alt="Airplane wing above the clouds"
                  className="h-auto w-full object-cover select-none pointer-events-none block"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Bottom gradient — seamless transition to content bg */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-slate-50/90 to-transparent z-30" />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
