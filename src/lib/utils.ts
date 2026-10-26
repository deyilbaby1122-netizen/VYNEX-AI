/** Tiny class-name joiner — keeps the bundle free of extra deps. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix = ""): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 20)
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}${random}`;
}

export function now(): number {
  return Date.now();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DAY = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export type DayBucket = "Today" | "Yesterday" | "Previous 7 days" | "Older";

export function bucketFor(ts: number): DayBucket {
  const today = startOfDay(Date.now());
  const day = startOfDay(ts);
  if (day >= today) return "Today";
  if (day >= today - DAY) return "Yesterday";
  if (day >= today - 7 * DAY) return "Previous 7 days";
  return "Older";
}

export function groupByDay<T extends { updatedAt: number }>(
  items: T[],
): Array<{ bucket: DayBucket; items: T[] }> {
  const order: DayBucket[] = ["Today", "Yesterday", "Previous 7 days", "Older"];
  const map = new Map<DayBucket, T[]>();
  for (const item of items) {
    const key = bucketFor(item.updatedAt);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return order
    .filter((bucket) => map.has(bucket))
    .map((bucket) => ({ bucket, items: map.get(bucket)! }));
}

export function bytesToSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function isValidConversationId(id: string): boolean {
  return /^[A-Za-z0-9_-]{6,64}$/.test(id);
}
