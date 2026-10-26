import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

/** VYNEX mark: a faceted hexagonal core with an orbiting particle. */
export function Logo({ size = 30, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="vynex-core" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C5CFF" />
          <stop offset="0.55" stopColor="#4B7CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="vynex-inner" x1="16" y1="14" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#FF5CC8" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.2 42.4 13.6v20.8L24 44.8 5.6 34.4V13.6L24 3.2Z"
        stroke="url(#vynex-core)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 17.5 24 34l7.5-16.5"
        stroke="url(#vynex-inner)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36.5" cy="12" r="3.2" fill="#22D3EE" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo />
      <span className="text-[15px] font-semibold tracking-[0.2em] text-white">
        VYNEX<span className="text-gradient-brand ml-1">AI</span>
      </span>
    </span>
  );
}
