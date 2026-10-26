"use client";

import Link from "next/link";
import { ArrowRight, Rocket, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";

const STACK = ["Next.js 16", "Tailwind CSS 4", "AI SDK", "Supabase", "Vercel"];

export function ClosingCTA() {
  return (
    <section className="relative mx-auto w-full max-w-[1400px] px-4 pb-24 pt-8 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-br from-accent/18 via-surface to-neon/10 px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 dot-surface opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/35 blur-[100px]" />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
            Ready to think
            <span className="text-gradient"> beyond limits</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] text-muted">
            Open the workspace, sign in, and start a thread. Your history follows
            you across devices — encrypted, private, yours.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/chat" className="btn-primary !px-6 !py-3.5 !text-[15px]">
              Launch VYNEX AI
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="btn-ghost !px-5 !py-3.5 !text-[15px]">
              Create an account
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-dim">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" /> Row-level security
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Rocket className="h-4 w-4 text-neon" /> Deploys to Vercel in one click
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              VYNEX AI — an advanced assistant for reasoning, voice, imagery and
              code. Built with an obsession for speed and craft.
            </p>
            <p className="mt-4 text-[13px] text-dim">
              Think Beyond Limits. © {new Date().getFullYear()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <nav className="flex flex-col gap-2.5 text-sm">
              <span className="text-[11px] uppercase tracking-widest text-dim">
                Product
              </span>
              <Link href="/chat" className="text-muted transition-colors hover:text-white">
                Chat
              </Link>
              <Link href="/images" className="text-muted transition-colors hover:text-white">
                Image studio
              </Link>
              <Link href="/settings" className="text-muted transition-colors hover:text-white">
                Settings
              </Link>
            </nav>
            <nav className="flex flex-col gap-2.5 text-sm">
              <span className="text-[11px] uppercase tracking-widest text-dim">
                Account
              </span>
              <Link href="/login" className="text-muted transition-colors hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="text-muted transition-colors hover:text-white">
                Create account
              </Link>
              <Link href="/#voice" className="text-muted transition-colors hover:text-white">
                Voice
              </Link>
            </nav>
            <div className="flex flex-col gap-2.5 text-sm">
              <span className="text-[11px] uppercase tracking-widest text-dim">
                Built with
              </span>
              <div className="flex flex-col gap-1.5 text-muted">
                {STACK.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-dim">
            AI output can be wrong — verify anything that matters.
          </p>
          <div className="flex items-center gap-3 text-[12.5px] text-muted">
            <Link href="/chat" className="transition-colors hover:text-white">
              Open the workspace
            </Link>
            <span className="h-3 w-px bg-line" />
            <Link href="/signup" className="transition-colors hover:text-white">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
