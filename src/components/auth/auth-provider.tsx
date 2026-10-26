"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabaseBrowser,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";
import { storageModeFor } from "@/lib/supabase/browser";
import type { StorageMode } from "@/lib/types";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  storageMode: StorageMode;
  signInWithPassword(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string, displayName: string): Promise<string | null>;
  signInWithGoogle(): Promise<string | null>;
  sendPasswordReset(email: string): Promise<string | null>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return "Accounts are not configured.";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? error.message : null;
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return "Accounts are not configured.";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) return error.message;

      // Profile row (name + language defaults) is created client-side; RLS
      // only permits inserting a row whose id matches the signed-in user.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? email,
          display_name: displayName || email.split("@")[0],
        });
      }
      return null;
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return "Accounts are not configured.";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    return error ? error.message : null;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return "Accounts are not configured.";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user: session?.user ?? null,
      session,
      storageMode: storageModeFor(session?.user ?? null),
      signInWithPassword,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
    }),
    [
      loading,
      session,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
