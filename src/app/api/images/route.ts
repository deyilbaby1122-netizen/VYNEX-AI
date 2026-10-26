import { generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import { getAuthUser } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isAIConfigured } from "@/lib/supabase/config";

export const maxDuration = 60;

const SIZES = new Set(["1024x1024", "1536x1024", "1024x1536"]);
const IMAGE_MODELS = new Set(["gpt-image-1", "dall-e-3"]);
const MAX_PROMPT = 1200;

function jsonError(status: number, error: string, extra?: Record<string, string>) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

/** 1x1 transparent PNG — lets the studio stay demoable without a key. */
const PLACEHOLDER_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">` +
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
  `<stop offset="0%" stop-color="#0b0d16"/><stop offset="55%" stop-color="#171535"/><stop offset="100%" stop-color="#0d2b33"/>` +
  `</linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>` +
  `<circle cx="512" cy="470" r="180" fill="none" stroke="#7c5cff" stroke-width="3" opacity="0.75"/>` +
  `<circle cx="512" cy="470" r="110" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.6"/>` +
  `<text x="512" y="760" fill="#e9ebf5" font-family="Helvetica,Arial" font-size="40" text-anchor="middle" font-weight="600">VYNEX AI</text>` +
  `<text x="512" y="812" fill="#8a90a8" font-family="Helvetica,Arial" font-size="24" text-anchor="middle">Add OPENAI_API_KEY to generate</text>` +
  `</svg>`;

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (auth.configured && !auth.user) {
    return jsonError(401, "Sign in to continue.");
  }

  const bucket = auth.user ? `img:${auth.user.id}` : `img-ip:${clientKey(request)}`;
  const limit = rateLimit(bucket, 10, 60_000);
  if (!limit.ok) {
    return jsonError(429, "Image rate limit reached. Try again shortly.", {
      "retry-after": String(Math.ceil(limit.retryAfterMs / 1000) || 1),
    });
  }

  let payload: { prompt?: unknown; size?: unknown; model?: unknown; n?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const prompt =
    typeof payload.prompt === "string" ? payload.prompt.trim().slice(0, MAX_PROMPT) : "";
  if (!prompt) return jsonError(400, "A prompt is required.");

  const size =
    typeof payload.size === "string" && SIZES.has(payload.size)
      ? payload.size
      : "1024x1024";

  const modelId =
    typeof payload.model === "string" && IMAGE_MODELS.has(payload.model)
      ? payload.model
      : "gpt-image-1";

  const count =
    typeof payload.n === "number" && payload.n >= 1 && payload.n <= 4
      ? Math.floor(payload.n)
      : 1;

  if (!isAIConfigured) {
    const placeholderDataUrl = `data:image/svg+xml;base64,${Buffer.from(
      PLACEHOLDER_SVG,
      "utf8",
    ).toString("base64")}`;
    return Response.json({
      images: Array.from({ length: count }, () => placeholderDataUrl),
      placeholder: true,
      model: modelId,
      size,
      prompt,
    });
  }

  try {
    const { images } = await generateImage({
      model: openai.image(modelId),
      prompt,
      size: size as `${number}x${number}`,
      n: count,
    });

    return Response.json({
      images: images.map((image) => `data:image/png;base64,${image.base64}`),
      placeholder: false,
      model: modelId,
      size,
      prompt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed.";
    return jsonError(502, message);
  }
}
