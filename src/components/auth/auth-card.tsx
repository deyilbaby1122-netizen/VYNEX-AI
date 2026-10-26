"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { NeuralField } from "@/components/landing/neural-field";
import { Wordmark } from "@/components/ui/logo";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isAIConfigured } from "@/lib/supabase/config";

interface AuthCardProps {
  mode: "login" | "signup";
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const {
    configured,
    loading,
    user,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [callbackError, setCallbackError] = useState(false);

  useEffect(() => {
    setCallbackError(new URLSearchParams(window.location.search).get("error") === "auth");
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [loading, user, router]);

  useEffect(() => {
    if (configured) return;
    setNotice(
      "Supabase keys are not set, so accounts are disabled. You can still use VYNEX in local mode.",
    );
  }, [configured]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (resetMode) {
        const message = await sendPasswordReset(email);
        if (message) setError(message);
        else setNotice("Password reset link sent — check your inbox.");
        return;
      }

      if (mode === "signup") {
        const message = await signUp(email, password, displayName.trim());
        if (message) {
          setError(message);
          return;
        }
        const supabase = getSupabaseBrowser();
        const {
          data: { user: created },
        } = supabase
          ? await supabase.auth.getUser()
          : { data: { user: null } };
        if (created) {
          router.replace("/chat");
        } else {
          setNotice("Account created. Confirm your email, then sign in.");
        }
        return;
      }

      const message = await signInWithPassword(email, password);
      if (message) {
        setError(message);
        return;
      }
      router.replace("/chat");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    setBusy(true);
    const message = await signInWithGoogle();
    if (message) setError(message);
    setBusy(false);
  }

  const isLogin = mode === "login" && !resetMode;

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-line lg:block">
        <div className="absolute inset-0 grid-surface opacity-60" />
        <div className="absolute left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
        <div className="absolute inset-0">
          <NeuralField className="h-full w-full" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/">
            <Wordmark />
          </Link>
          <div>
            <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.03em] text-white">
              Your threads, your voice, your models.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Sign in to sync chat history across devices, keep your image studio
              gallery private, and pick up exactly where you left off.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-[12px] text-dim">
              <span className="rounded-full border border-line px-3 py-1">
                Row-level security
              </span>
              <span className="rounded-full border border-line px-3 py-1">
                End-to-end session cookies
              </span>
              <span className="rounded-full border border-line px-3 py-1">
                No training on your data
              </span>
            </div>
          </div>
          <p className="text-[13px] text-dim">Think Beyond Limits.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-neon/12 blur-[110px]" />
        <div className="w-full max-w-[430px]">
          <div className="lg:hidden">
            <Link href="/">
              <Wordmark />
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-line bg-surface/80 p-7 backdrop-blur-xl glow-ring sm:p-8">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">
              {resetMode
                ? "Reset password"
                : mode === "signup"
                  ? "Create your account"
                  : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {resetMode
                ? "We will email you a secure reset link."
                : mode === "signup"
                  ? "Free forever for personal use. No card required."
                  : "Sign in to continue to your workspace."}
            </p>

            {callbackError ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                That sign-in link was invalid or expired. Try again.
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            ) : null}

            {notice ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-success/35 bg-success/10 px-3.5 py-3 text-[13px] text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{notice}</span>
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && !resetMode ? (
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-muted">
                    Display name
                  </span>
                  <input
                    className="field"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    required
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-muted">
                  Email
                </span>
                <input
                  className="field"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              {!resetMode ? (
                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-muted">
                    Password
                    {isLogin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResetMode(true);
                          setError(null);
                        }}
                        className="text-[12.5px] text-neon hover:underline"
                      >
                        Forgot?
                      </button>
                    ) : null}
                  </span>
                  <input
                    className="field"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={mode === "signup" ? 8 : 1}
                    required
                  />
                </label>
              ) : null}

              <button
                type="submit"
                disabled={busy || !configured || (mode === "signup" && !isLogin && password.length < 8)}
                className="btn-primary w-full !py-3"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : resetMode ? (
                  <>
                    Send reset link <Mail className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {mode === "signup" ? "Create account" : "Sign in"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {configured && !resetMode ? (
              <>
                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-dim">
                  <span className="h-px flex-1 bg-line" />
                  or
                  <span className="h-px flex-1 bg-line" />
                </div>
                <button
                  type="button"
                  onClick={google}
                  disabled={busy}
                  className="btn-ghost w-full !py-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </>
            ) : null}

            {!configured ? (
              <div className="mt-5 rounded-xl border border-warning/35 bg-warning/10 px-3.5 py-3 text-[13px] text-warning">
                Accounts activate once you add{" "}
                <code className="rounded bg-warning/15 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                and{" "}
                <code className="rounded bg-warning/15 px-1">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                to <code className="rounded bg-warning/15 px-1">.env.local</code>.
              </div>
            ) : null}

            <p className="mt-6 text-center text-sm text-muted">
              {resetMode ? (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-neon hover:underline"
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "signup" ? "Already have an account? " : "New to VYNEX? "}
                  <Link
                    href={mode === "signup" ? "/login" : "/signup"}
                    className="text-neon hover:underline"
                  >
                    {mode === "signup" ? "Sign in" : "Create one free"}
                  </Link>
                </>
              )}
            </p>
          </div>

          {!configured ? (
            <Link
              href="/chat"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-white"
            >
              Continue in local mode <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          {!isAIConfigured ? (
            <p className="mt-4 text-center text-[12px] text-dim">
              Scaffold mode: model responses are simulated until an OpenAI key is set.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
