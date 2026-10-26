"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Mic, Orbit, Sparkles, Zap } from "lucide-react";
import { NeuralField } from "./neural-field";

const STATS = [
  { value: "<0.4s", label: "first token" },
  { value: "40+", label: "languages" },
  { value: "4", label: "modalities" },
  { value: "99.99%", label: "uptime" },
];

const FLOATERS = [
  {
    icon: Mic,
    title: "Live voice",
    note: "natural duplex",
    className: "left-[6%] top-[26%] hidden lg:flex",
    delay: "0s",
  },
  {
    icon: Code2,
    title: "Code engine",
    note: "20+ languages",
    className: "right-[7%] top-[22%] hidden lg:flex",
    delay: "1.4s",
  },
  {
    icon: Sparkles,
    title: "Image studio",
    note: "1024px · 4s",
    className: "bottom-[24%] left-[10%] hidden lg:flex",
    delay: "2.1s",
  },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* backdrop layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid-surface mask-fade-b opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[130px]" />
      <div className="pointer-events-none absolute right-[8%] top-[35%] -z-10 h-[26rem] w-[26rem] rounded-full bg-neon/12 blur-[120px]" />
      <div className="pointer-events-none absolute left-[4%] bottom-[6%] -z-10 h-[24rem] w-[24rem] rounded-full bg-magenta/10 blur-[120px]" />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-[#c9c0ff]">
              <Orbit className="h-3.5 w-3.5" />
              VYNEX 2.0 — multi-modal intelligence
            </span>

            <h1 className="mt-6 text-[clamp(2.6rem,6.4vw,4.6rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-white">
              Think
              <span className="text-gradient mx-3">Beyond</span>
              <br className="hidden sm:block" />
              Limits.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted lg:mx-0">
              One premium workspace where frontier models meet real-time voice,
              generative imagery and precision coding — streamed token by token,
              secured by your own account, ready for production.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/chat" className="btn-primary !px-6 !py-3.5 !text-[15px]">
                Start thinking free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#studio" className="btn-ghost !px-5 !py-3.5 !text-[15px]">
                <Zap className="h-4 w-4 text-neon" />
                Watch it work
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-4 gap-4 border-t border-line/70 pt-7 text-center lg:text-left">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-lg font-semibold text-white sm:text-xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-0.5 text-[11px] uppercase tracking-wider text-dim">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto h-[380px] w-full max-w-[520px] sm:h-[460px]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 grid place-items-center">
                <NeuralField className="h-full w-full" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-[-8%] -z-10 rounded-full bg-accent/8 blur-3xl" />

            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                  <Sparkles className="h-7 w-7 text-white" />
                </span>
                <span className="text-xs font-medium tracking-[0.28em] text-white/75">
                  VYNEX AI
                </span>
              </div>
            </div>

            {FLOATERS.map((item) => (
              <div
                key={item.title}
                className={`absolute items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-3.5 py-2.5 backdrop-blur-xl shadow-lg shadow-black/40 animate-float ${item.className}`}
                style={{ animationDelay: item.delay }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent/70 to-neon/60">
                  <item.icon className="h-4 w-4 text-white" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-medium text-white">
                    {item.title}
                  </span>
                  <span className="block text-[11px] text-muted">{item.note}</span>
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-6 pb-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-dim">
          <span className="h-px w-8 bg-line" />
          scroll to explore
          <span className="h-px w-8 bg-line" />
        </div>
      </div>
    </section>
  );
}
