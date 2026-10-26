"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Code2,
  FileUp,
  Globe,
  History,
  ImagePlus,
  MessagesSquare,
  Mic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  span: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessagesSquare,
    title: "Intelligent chat",
    description:
      "Token-streamed reasoning with markdown, tables, follow-ups, regeneration and a stop button that actually stops.",
    span: "lg:col-span-2",
    accent: "from-accent/70 to-accent-deep/60",
  },
  {
    icon: Mic,
    title: "Real-time voice",
    description:
      "Speak your prompt, hear the answer back — live dictation with interim transcripts and spoken replies.",
    span: "lg:col-span-1",
    accent: "from-neon/70 to-accent/50",
  },
  {
    icon: ImagePlus,
    title: "Image generation",
    description:
      "A dedicated studio: prompts, aspect ratios, up to four variations, gallery history and one-click download.",
    span: "lg:col-span-1",
    accent: "from-magenta/70 to-accent/50",
  },
  {
    icon: Code2,
    title: "Coding assistance",
    description:
      "A dedicated Code mode tuned for engineering: syntax-highlighted blocks, copy buttons, reviews and debugging.",
    span: "lg:col-span-2",
    accent: "from-accent/60 to-neon/50",
  },
  {
    icon: Globe,
    title: "Multilingual",
    description: "Auto-detect or pin a language across 25 options.",
    span: "lg:col-span-1",
    accent: "from-neon/60 to-success/40",
  },
  {
    icon: History,
    title: "Chat history",
    description: "Searchable threads grouped by day, synced and deletable.",
    span: "lg:col-span-1",
    accent: "from-accent/60 to-magenta/40",
  },
  {
    icon: FileUp,
    title: "File uploads",
    description: "Attach images and text files — vision-capable, inline previews.",
    span: "lg:col-span-1",
    accent: "from-warning/60 to-magenta/40",
  },
  {
    icon: BrainCircuit,
    title: "Private accounts",
    description:
      "Supabase sessions with row-level security keep every thread yours — enforced on the server, not the client.",
    span: "lg:col-span-2",
    accent: "from-success/60 to-neon/40",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-[1400px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.32em] text-neon">
          Capabilities
        </span>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          Every modality. One surface.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-muted">
          VYNEX collapses the tabs, tools and subscriptions you juggle into a single
          workspace that streams answers as fast as you can think them.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative overflow-hidden rounded-2xl border border-line bg-surface/70 p-6 transition-colors duration-300 hover:border-accent/45 ${feature.span}`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/0 blur-2xl transition-all duration-500 group-hover:bg-accent/25" />
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} shadow-lg shadow-black/40`}
            >
              <feature.icon className="h-5 w-5 text-white" strokeWidth={1.9} />
            </span>
            <h3 className="mt-5 text-[17px] font-semibold text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
