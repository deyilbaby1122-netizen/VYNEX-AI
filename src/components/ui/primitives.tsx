import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent",
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "danger" | "warning";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "border-line bg-white/5 text-muted",
    accent: "border-accent/40 bg-accent/12 text-[#c6bcff]",
    success: "border-success/40 bg-success/10 text-success",
    danger: "border-danger/40 bg-danger/10 text-danger",
    warning: "border-warning/40 bg-warning/10 text-warning",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-line" />;
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-dim">
      <span className="h-px flex-1 bg-line" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
