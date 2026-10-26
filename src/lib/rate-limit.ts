/**
 * Fixed-window rate limiter.
 *
 * Vercel serverless instances are ephemeral, so this is per-instance state:
 * it is a guard rail against accidental loops and key scraping, not a
 * distributed quota. Combine with Supabase auth (which is required whenever
 * the project is configured) for real per-user control.
 */

interface Bucket {
  windowStart: number;
  count: number;
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const nowMs = Date.now();

  if (buckets.size > MAX_KEYS) {
    for (const [k, bucket] of buckets) {
      if (nowMs - bucket.windowStart > windowMs) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || nowMs - bucket.windowStart > windowMs) {
    buckets.set(key, { windowStart: nowMs, count: 1 });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.windowStart + windowMs - nowMs),
    };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

export function clientKey(request: Request, fallback = "anonymous"): string {
  const forwarding = request.headers.get("x-forwarded-for");
  const ip = forwarding?.split(",")[0]?.trim();
  return ip || fallback;
}
