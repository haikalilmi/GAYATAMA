"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { CloudShader } from "@/components/ui/cloud-shader";
import {
  ArrowRight,
  Compass,
  Radio,
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
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */
const SHRINK_DISTANCE     = 400;
const SIDEBAR_W           = 288;
const DESKTOP_INSET       = 16;
const MOBILE_INSET        = 8;
const DESKTOP_RADIUS      = 24;
const MOBILE_RADIUS       = 16;
const DESKTOP_HERO_HEIGHT = 440;
const MOBILE_HERO_HEIGHT  = 480;
const GAP_BELOW_HERO      = 24;

export function FlightHero({
  verifiedActions,
  contributors,
  wasteCollected,
  isLoggedIn,
}: FlightHeroProps) {
  /* ---- scroll tracking ------------------------------------------ */
  const { scrollY } = useScroll();

  /* ---- responsive breakpoint & window height -------------------- */
  const [isMd, setIsMd] = useState(true);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const updateDimensions = () => {
      setIsMd(window.innerWidth >= 768);
      setVh(window.innerHeight);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const heroCardHeight = Math.min(
    isMd ? DESKTOP_HERO_HEIGHT : MOBILE_HERO_HEIGHT,
    Math.max(300, vh - 60),
  );
  const inset    = isMd ? DESKTOP_INSET : MOBILE_INSET;
  const radius   = isMd ? DESKTOP_RADIUS : MOBILE_RADIUS;
  const sidebarW = isMd ? SIDEBAR_W : 0;

  /* ---- shrink progress (0 to 1 during first 400px of scroll) ---- */
  const shrinkProgress = useTransform(scrollY, [0, SHRINK_DISTANCE], [0, 1], {
    clamp: true,
  });

  /* ---- translate Y: when scrollY > SHRINK_DISTANCE, hero scrolls up with page ---- */
  const translateY = useTransform(scrollY, (y) =>
    y > SHRINK_DISTANCE ? -(y - SHRINK_DISTANCE) : 0,
  );

  /* ---- disable pointer events when hero is scrolled off-screen ---- */
  const pointerEvents = useTransform(scrollY, (y) =>
    y > SHRINK_DISTANCE + inset + heroCardHeight + 50 ? "none" : "auto",
  );

  /* ---- clip-path based shrink (no resize = no WebGL flicker) ---- */
  const clipPath = useTransform(shrinkProgress, (v) => {
    const top    = v * inset;
    const right  = v * inset;
    const bottom = v * (vh - inset - heroCardHeight);
    const left   = v * (sidebarW + inset);
    const r      = v * radius;
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px)`;
  });

  /* Content container positioning — matches clip area exactly */
  const heroTop = useTransform(shrinkProgress, (v) => v * inset);
  const heroLeft = useTransform(shrinkProgress, (v) => v * (sidebarW + inset));
  const heroRight = useTransform(shrinkProgress, (v) => v * inset);
  const heroBottom = useTransform(
    shrinkProgress,
    (v) => v * (vh - inset - heroCardHeight),
  );

  /* Content parallax inside the hero */
  const contentY       = useTransform(shrinkProgress, [0, 1], [0, -30]);
  const contentOpacity = useTransform(shrinkProgress, [0, 0.6, 1], [1, 0.95, 0.85]);
  const hudY           = useTransform(shrinkProgress, [0, 1], [0, -15]);
  const hudOpacity     = useTransform(shrinkProgress, [0, 0.5, 1], [1, 0.95, 0.9]);
  const statusBarY     = useTransform(shrinkProgress, [0, 1], [0, -40]);
  const wingY          = useTransform(shrinkProgress, [0, 1], [0, 25]);

  return (
    <>
      {/* Scroll spacer — drives the shrink runway & reserves space so content sits directly below hero card */}
      <div
        style={{
          height: `${SHRINK_DISTANCE + inset + heroCardHeight + GAP_BELOW_HERO}px`,
        }}
        aria-hidden="true"
      />

      {/* Hero — fixed inset-0, uses clip-path to visually shrink.
          When scrollY > SHRINK_DISTANCE, translates up seamlessly with page content. */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{
          clipPath,
          WebkitClipPath: clipPath,
          y: translateY,
          pointerEvents,
          willChange: "clip-path, transform",
        }}
      >
        {/* ---- Background + Cloud Shader — full viewport, GPU-isolated */}
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

        {/* ---- Content — positioned to fill the visible clipped area */}
        <motion.div
          className="absolute z-20"
          style={{
            top: heroTop,
            left: heroLeft,
            right: heroRight,
            bottom: heroBottom,
          }}
        >
          <div className="flex h-full flex-col justify-between px-5 py-5 md:px-10 md:py-8">
            {/* Top Flight Status Bar */}
            <motion.div
              className="flex flex-wrap items-center justify-between gap-3"
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
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-white/80">
                <Radio className="h-3.5 w-3.5 text-emerald-300" />
                <span>Telemetry Live Data</span>
              </div>
            </motion.div>

            {/* Main Copy + HUD Grid */}
            <div className="my-4 grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left — narrative */}
              <motion.div
                className="lg:col-span-7 space-y-4"
                style={{ y: contentY, opacity: contentOpacity }}
              >
                <div className="inline-flex items-center gap-2 rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                  <span>Platform Aksi Sosial & Lingkungan Terverifikasi</span>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl [text-shadow:0_2px_16px_rgba(10,35,60,0.45)] leading-tight">
                  Turn Good Actions Into Measurable Impact
                </h1>

                <p className="max-w-xl text-sm text-balance text-white/90 sm:text-base leading-relaxed [text-shadow:0_1px_4px_rgba(10,35,60,0.3)]">
                  Pantau dan jalankan misi kebaikan dari sudut pandang ketinggian.
                  Selesaikan aksi nyata di lapangan, verifikasi bukti dengan
                  transparan, dan raih XP serta reward berdampak.
                </p>

                <div className="relative z-30 flex flex-wrap items-center gap-3 pt-1">
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
                      <p className="text-[10px] text-white/60">Terverifikasi sistem</p>
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

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
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
                      className="text-xs font-semibold text-sky-300 hover:text-white transition-colors underline underline-offset-2"
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
          {/* Outer handles scroll-driven parallax via style.y */}
          <motion.div
            className="pointer-events-none absolute -bottom-20 md:-bottom-28 left-0 z-10 w-[75%] md:w-[50%]"
            style={{
              y: wingY,
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          >
            {/* Inner handles gentle idle floating bobbing animation — separate node prevents transform conflict/jitter */}
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
    </>
  );
}
