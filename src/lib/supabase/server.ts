import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

export interface AuthResult {
  configured: boolean;
  user: User | null;
  /** Set when Supabase is configured but no valid session exists. */
  reason?: "no-session" | "invalid-session";
}

/**
 * Resolves the acting user for a route handler. `getUser()` is used rather
 * than the cached session because it re-validates the JWT with Supabase —
 * a forged cookie is rejected here instead of reaching the model.
 */
export async function getAuthUser(): Promise<AuthResult> {
  if (!isSupabaseConfigured) return { configured: false, user: null };

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — middleware/proxy refreshes instead.
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { configured: true, user: null, reason: "invalid-session" };
  }
  return { configured: true, user };
}
