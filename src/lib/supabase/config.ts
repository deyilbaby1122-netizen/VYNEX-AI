export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * When both publishable env vars are present the app runs in account mode:
 * sessions are issued by Supabase and history is persisted with row-level
 * security. Without them it degrades to a fully local (localStorage) mode
 * so the product is still demonstrable before any credentials exist.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Server-only key. Never exposed to the browser, never required. */
export const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const isAIConfigured = Boolean(OPENAI_API_KEY);
