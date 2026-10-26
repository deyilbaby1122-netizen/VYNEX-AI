import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { LANGUAGES, buildSystemPrompt, modeOption } from "@/lib/ai";
import { isAIConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { ChatMode } from "@/lib/types";

export const maxDuration = 60;

const ALLOWED_MODELS = new Set(["gpt-4o", "gpt-4o-mini"]);
const ALLOWED_MODES = new Set<ChatMode>(["assistant", "code", "translate"]);
const ALLOWED_LANGUAGES = new Set(LANGUAGES.map((language) => language.code));
const MAX_MESSAGES = 160;

function jsonError(status: number, error: string, extra?: Record<string, string>) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

/**
 * Streams a plain guidance reply through the normal UI-message protocol so
 * the client pipeline stays fully exercisable before an OpenAI key exists.
 */
function streamGuidance(text: string) {
  const chunks = text.match(/[\s\S]{1,48}/g) ?? [text];
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: "text-0" });
      for (const chunk of chunks) {
        writer.write({ type: "text-delta", id: "text-0", delta: chunk });
      }
      writer.write({ type: "text-end", id: "text-0" });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();

  // With Supabase configured, every model call must come from a verified
  // session — otherwise the project's OpenAI key would be open to the world.
  if (auth.configured && !auth.user) {
    return jsonError(401, "Sign in to continue.");
  }

  const bucket = auth.user ? `user:${auth.user.id}` : `ip:${clientKey(request)}`;
  const limit = rateLimit(bucket, auth.user ? 40 : 15, 60_000);
  if (!limit.ok) {
    return jsonError(429, "Too many requests. Slow down for a moment.", {
      "retry-after": String(Math.ceil(limit.retryAfterMs / 1000) || 1),
    });
  }

  let payload: {
    messages?: UIMessage[];
    model?: unknown;
    mode?: unknown;
    language?: unknown;
    title?: unknown;
  };
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const rawMessages = payload.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return jsonError(400, "messages must be a non-empty array.");
  }
  if (rawMessages.length > MAX_MESSAGES) {
    return jsonError(413, `Conversation too long (max ${MAX_MESSAGES} messages).`);
  }

  const messages = rawMessages.filter(
    (message): message is UIMessage =>
      Boolean(message) &&
      typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      Array.isArray(message.parts),
  );
  if (messages.length === 0) {
    return jsonError(400, "No sendable messages were provided.");
  }

  const modelId =
    typeof payload.model === "string" && ALLOWED_MODELS.has(payload.model)
      ? payload.model
      : "gpt-4o";

  const mode =
    typeof payload.mode === "string" && ALLOWED_MODES.has(payload.mode as ChatMode)
      ? (payload.mode as ChatMode)
      : "assistant";

  const language =
    typeof payload.language === "string" && ALLOWED_LANGUAGES.has(payload.language)
      ? payload.language
      : "auto";

  if (!isAIConfigured) {
    return streamGuidance(
      "VYNEX AI is running in **scaffold mode** — the interface, history, voice and file pipeline are all live, but no model key is connected yet.\n\n" +
        "Add your OpenAI key to enable real streaming answers:\n\n" +
        "```bash\n# .env.local\nOPENAI_API_KEY=sk-...\n```\n\n" +
        "Then restart the dev server. For accounts and cloud history, also add:\n\n" +
        "```bash\nNEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...\n```\n\n" +
        `Your request reached the server correctly with mode \`${mode}\` and model \`${modelId}\`.`,
    );
  }

  const options = modeOption(mode);
  const system = buildSystemPrompt(mode, language);

  const result = streamText({
    model: openai(modelId),
    system,
    messages: await convertToModelMessages(messages),
    temperature: options.temperature,
    maxOutputTokens: 4096,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}