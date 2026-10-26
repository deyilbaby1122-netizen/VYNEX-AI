import type { ChatMode } from "./types";

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
}

export const MODELS: ModelOption[] = [
  {
    id: "gpt-4o",
    name: "VYNEX Pro",
    tag: "Flagship",
    description: "Deep reasoning, vision and complex coding",
  },
  {
    id: "gpt-4o-mini",
    name: "VYNEX Flash",
    tag: "Fastest",
    description: "Everyday answers, translation and quick drafts",
  },
];

export function modelLabel(id: string): string {
  return MODELS.find((model) => model.id === id)?.name ?? id;
}

export interface ModeOption {
  id: ChatMode;
  label: string;
  hint: string;
  temperature: number;
}

export const MODES: ModeOption[] = [
  {
    id: "assistant",
    label: "Assistant",
    hint: "General reasoning, research and writing",
    temperature: 0.7,
  },
  {
    id: "code",
    label: "Code",
    hint: "Software engineering, debugging and reviews",
    temperature: 0.25,
  },
  {
    id: "translate",
    label: "Translate",
    hint: "Faithful, format-preserving translation",
    temperature: 0.3,
  },
];

export function modeOption(id: ChatMode): ModeOption {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}

export interface LanguageOption {
  code: string;
  label: string;
  native: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "auto", label: "Auto-detect", native: "Automatic" },
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "he", label: "Hebrew", native: "עברית" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "fa", label: "Persian", native: "فارسی" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
];

export function languageOption(code: string): LanguageOption {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];
}

const CORE_PERSONA = `You are VYNEX AI — a premium, frontier-class assistant built for people who think beyond limits.

Operating principles:
- Be direct and precise. Lead with the answer, then the reasoning.
- Prefer structure: short paragraphs, headings, lists and tables when they improve scanability.
- Never invent facts, numbers, APIs or citations. If you are unsure, say so plainly and say what would settle it.
- Match the user's language and register. If a language preference is supplied below, honour it for the entire reply.
- Use Markdown. Put code in fenced blocks with a language tag.
- Keep momentum: no filler, no restating the question, no apologising unnecessarily.`;

const MODE_PROMPTS: Record<ChatMode, string> = {
  assistant: `${CORE_PERSONA}

Your role for this conversation is general assistant: research, analysis, planning, writing, brainstorming and explanation.`,
  code: `${CORE_PERSONA}

Your role for this conversation is senior software engineer. Additional rules:
- Return complete, runnable code — never fragments or "rest omitted" placeholders unless truly irrelevant.
- State the language/framework and any version assumptions in one short line before the code.
- Prefer correct, idiomatic, secure, performant solutions; mention trade-offs in a sentence when they matter.
- Flag bugs, security issues and edge cases you notice in code the user shares.
- Use fenced code blocks with an explicit language tag so they syntax-highlight.`,
  translate: `${CORE_PERSONA}

Your role for this conversation is professional translator. Additional rules:
- Detect the source language, then translate into the requested language with native-quality phrasing.
- Preserve Markdown structure, code blocks, placeholders, HTML entities, capitalisation and tone.
- Never summarise, censor or add commentary unless the user asks for notes.
- If the target language is ambiguous, state your assumption in one line, then translate.`,
};

export function buildSystemPrompt(mode: ChatMode, languageCode: string): string {
  const parts = [MODE_PROMPTS[mode] ?? MODE_PROMPTS.assistant];
  const lang = languageOption(languageCode);
  if (lang.code !== "auto") {
    parts.push(
      `Language preference: write every response in ${lang.label} (${lang.native}). Translate user input silently if needed.`,
    );
  } else {
    parts.push(
      "Language preference: auto-detect — reply in the same language the user wrote in.",
    );
  }
  return parts.join("\n\n");
}

export function titleFromPrompt(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  const clipped = clean.length > 46 ? `${clean.slice(0, 46).trimEnd()}…` : clean;
  return clipped.charAt(0).toUpperCase() + clipped.slice(1);
}

export const SUGGESTIONS: Array<{ title: string; prompt: string; mode: ChatMode }> = [
  {
    title: "Design a system",
    prompt:
      "Design a production-ready architecture for a real-time chat application that scales to 100k concurrent users. Cover the data model, transport, caching and failure modes.",
    mode: "assistant",
  },
  {
    title: "Debug this code",
    prompt:
      "Walk me through a systematic debugging method for a Next.js app where an API route returns stale data in production but is fine locally. Give me a checklist.",
    mode: "code",
  },
  {
    title: "Ship a landing page",
    prompt:
      "Write the full copy and section outline for a futuristic landing page for an AI product called VYNEX AI — tagline: Think Beyond Limits.",
    mode: "assistant",
  },
  {
    title: "Translate a contract",
    prompt:
      "Translate this contract clause into Spanish while preserving the legal register and numbered structure:\n\n1. The Parties shall use commercially reasonable efforts to perform their obligations under this Agreement.",
    mode: "translate",
  },
];
