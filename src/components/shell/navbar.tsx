"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Images,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Wordmark } from "@/components/ui/logo";
import { initialsOf, cn } from "@/lib/utils";

const APP_LINKS = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/images", label: "Images", icon: Images },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface NavbarProps {
  variant?: "landing" | "app";
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, configured, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links =
    variant === "app"
      ? APP_LINKS
      : [
          { href: "/#features", label: "Features", icon: Sparkles },
          { href: "/#studio", label: "Studio", icon: Images },
          { href: "/#voice", label: "Voice", icon: Mic },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 glass">
      <nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="transition-opacity hover:opacity-85">
          <Wordmark />
        </Link>

        <div className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              variant === "app" && pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/15 text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {configured && !loading && !user ? (
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
          ) : null}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-line bg-white/5 py-1 pl-1 pr-2.5 transition-colors hover:border-accent/50"
                aria-expanded={menuOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-neon text-[12px] font-bold text-black">
                  {initialsOf(
                    (user.user_metadata?.display_name as string) ||
                      user.email ||
                      "VX",
                  )}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-11 w-60 overflow-hidden rounded-xl border border-line bg-[#0c0e18] shadow-2xl shadow-black/60">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-medium text-white">
                      {(user.user_metadata?.display_name as string) || "Account"}
                    </p>
                    <p className="truncate text-xs text-dim">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" /> Account settings
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {variant === "landing" ? (
            <Link href="/chat" className="btn-primary !px-4 !py-2.5">
              Launch app
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/5 text-muted md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-line/70 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {variant === "landing" && !user ? (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function EnvBanner() {
  const { configured } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(
      !configured && !window.sessionStorage.getItem("vynex:banner-dismissed"),
    );
  }, [configured]);

  if (!visible) return null;
  return (
    <div className="border-b border-warning/25 bg-warning/8 px-4 py-2 text-center text-xs text-warning">
      Scaffold mode — add{" "}
      <code className="rounded bg-warning/15 px-1.5 py-0.5">OPENAI_API_KEY</code>{" "}
      and Supabase keys in <code className="rounded bg-warning/15 px-1.5 py-0.5">.env.local</code>{" "}
      for live AI + accounts.
      <button
        type="button"
        onClick={() => {
          window.sessionStorage.setItem("vynex:banner-dismissed", "1");
          setVisible(false);
        }}
        className="ml-3 underline underline-offset-2 hover:text-white"
      >
        dismiss
      </button>
    </div>
  );
}
