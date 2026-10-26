"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Download,
  Image as ImageIcon,
  Mic,
  MessagesSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "chat" | "voice" | "images" | "code";

const TABS: Array<{ id: TabId; label: string; icon: typeof Mic }> = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "code", label: "Code", icon: Code2 },
];

const CHAT_SCRIPT = [
  {
    role: "user" as const,
    text: "Design a rate limiter that survives serverless cold starts.",
  },
  {
    role: "assistant" as const,
    text: "Use a **fixed-window counter** in a shared store (Redis/Upstash) keyed by user + window, then gate locally with a token bucket to absorb cold starts.\n\n1. `INCR key` + `EXPIRE 60` on the shared store\n2. Local bucket absorbs the first 100 ms of jitter\n3. Return `Retry-After` from the remaining window",
  },
];

function useTypewriter(target: string, active: boolean, speed = 16) {
  const [text, setText] = useState("");
  const index = useRef(0);

  useEffect(() => {
    if (!active) return;
    index.current = 0;
    setText("");
    const id = window.setInterval(() => {
      index.current += 1;
      setText(target.slice(0, index.current));
      if (index.current >= target.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [target, active, speed]);

  return text;
}

function ChatDemo() {
  const typed = useTypewriter(CHAT_SCRIPT[1].text, true, 14);
  const done = typed.length >= CHAT_SCRIPT[1].text.length;

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-accent/35 bg-accent/15 px-4 py-2.5 text-[13.5px] leading-relaxed text-white">
          {CHAT_SCRIPT[0].text}
        </div>
      </div>

      <div className="flex gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent to-neon">
          <Sparkles className="h-3.5 w-3.5 text-black" />
        </span>
        <div className="rounded-2xl rounded-tl-md border border-line bg-white/[0.04] px-4 py-3 text-[13.5px] leading-relaxed text-[#d7dae8]">
          <span className="whitespace-pre-wrap">{typed}</span>
          {!done ? <span className="typing-caret" /> : null}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-xl border border-line bg-black/40 px-3 py-2.5">
        <span className="flex-1 text-[13px] text-dim">Ask VYNEX anything…</span>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/85">
          <Send className="h-3.5 w-3.5 text-white" />
        </span>
      </div>
    </div>
  );
}

function VoiceDemo() {
  const bars = Array.from({ length: 28 });
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-32 items-end gap-[3px]">
        {bars.map((_, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-accent via-neon to-magenta"
            style={{
              height: `${28 + Math.abs(Math.sin(index * 1.1)) * 74}%`,
              animation: `pulse-soft ${0.8 + (index % 5) * 0.18}s ease-in-out ${index * 0.05}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-danger/20 ring-2 ring-danger/50">
          <Mic className="h-4 w-4 text-danger animate-pulse-soft" />
        </span>
        <span className="font-mono text-[13px] text-neon">
          &ldquo;Summarise this quarter&apos;s roadmap in three bullets…&rdquo;
        </span>
      </div>
      <p className="text-center text-[13px] text-dim">
        Web Speech API · interim transcript · spoken replies
      </p>
    </div>
  );
}

const IMAGE_TILES = [
  { label: "neon city, rain, 35mm", from: "from-[#1b1440]", to: "to-[#0b2f3a]" },
  { label: "glass sculpture, studio", from: "from-[#3a1030]", to: "to-[#101a44]" },
  { label: "orbital station, dawn", from: "from-[#0d2246]", to: "to-[#3a1450]" },
  { label: "wireframe tiger, cyan", from: "from-[#08262e]", to: "to-[#2a1050]" },
];

function ImagesDemo() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 p-5">
      {IMAGE_TILES.map((tile, index) => (
        <motion.figure
          key={tile.label}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.12, duration: 0.5 }}
          className={cn(
            "group relative flex items-end overflow-hidden rounded-xl bg-gradient-to-br border border-line",
            tile.from,
            tile.to,
          )}
        >
          <div className="absolute inset-0 dot-surface opacity-30" />
          <figcaption className="relative flex w-full items-center justify-between gap-2 p-3 text-[11px] text-white/75">
            <span className="truncate">{tile.label}</span>
            <Download className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

const CODE_SAMPLE = `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are VYNEX AI.",
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}`;

function CodeDemo() {
  const tokens = CODE_SAMPLE.split(/(\s+|\b)/);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2 px-2 pb-3 text-[11px] text-dim">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-2 font-mono">route.ts</span>
      </div>
      <pre className="vynex-prose flex-1 overflow-hidden text-[12px] leading-[1.7]">
        <code>
          {tokens.map((token, index) => {
            const isKeyword = /^(import|from|export|async|function|const|return|await)$/.test(
              token,
            );
            const isString = /^["'].*["']$/.test(token.trim());
            const isComment = token.startsWith("//");
            return (
              <span
                key={index}
                className={cn(
                  isKeyword && "text-[#c792ea]",
                  isString && "text-[#a5e0a0]",
                  isComment && "text-dim italic",
                  /^["']?(streamText|openai|createUIMessageStreamResponse|toUIMessageStream|convertToModelMessages|POST|Request)[("']?$/.test(
                    token,
                  ) && "text-[#82aaff]",
                )}
              >
                {token}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

export function Showcase() {
  const [tab, setTab] = useState<TabId>("chat");

  return (
    <section id="studio" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.32em] text-magenta">
            The studio
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Four engines, one keyboard.
          </h2>
          <p className="mt-5 text-[17px] text-muted">
            Switch modes without switching apps — context follows you across every
            modality.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div
            role="tablist"
            aria-label="Studio modes"
            className="flex flex-wrap justify-center gap-1 rounded-2xl border border-line bg-surface/80 p-1.5"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  tab === item.id
                    ? "bg-gradient-to-r from-accent to-accent-deep text-white shadow-lg shadow-accent/30"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 h-[420px] max-w-3xl overflow-hidden rounded-3xl border border-line bg-[#080a12]/90 shadow-2xl shadow-black/60 backdrop-blur-xl glow-ring">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {tab === "chat" ? <ChatDemo /> : null}
              {tab === "voice" ? <VoiceDemo /> : null}
              {tab === "images" ? <ImagesDemo /> : null}
              {tab === "code" ? <CodeDemo /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function VoiceBand() {
  return (
    <section id="voice" className="relative overflow-hidden border-y border-line/70 bg-surface/40 py-20">
      <div className="pointer-events-none absolute inset-0 grid-surface opacity-50 mask-radial" />
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.32em] text-neon">
            Real-time voice
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white">
            Talk to it like it&rsquo;s already in the room.
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-muted">
            Hold a conversation with live microphone dictation, watch your words
            land as they are spoken, and let VYNEX read answers back with natural
            speech synthesis — in the same language you are using.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {[
              "Live interim transcript",
              "One-tap mute & stop",
              "25 interface languages",
              "No extra API key required",
            ].map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-[12.5px] text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex h-52 w-full max-w-sm items-center justify-center gap-1.5 rounded-3xl border border-line bg-black/40 lg:w-80">
          {Array.from({ length: 34 }).map((_, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-gradient-to-t from-accent via-neon to-magenta"
              style={{
                height: `${20 + Math.abs(Math.cos(index * 0.7)) * 70}%`,
                animation: `pulse-soft ${1 + (index % 7) * 0.2}s ease-in-out ${index * 0.06}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
