import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Completes an OAuth or email-link handshake by exchanging the provider
 * `code` for a session cookie, then returns the user to the app.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/chat";

  const redirectTarget = new URL(next, url.origin);

  if (code && isSupabaseConfigured) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectTarget.pathname = "/login";
      redirectTarget.search = "?error=auth";
    }
  } else if (!code) {
    redirectTarget.pathname = "/login";
    redirectTarget.search = "?error=auth";
  }

  return NextResponse.redirect(redirectTarget);
}
