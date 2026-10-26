import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { StorageMode } from "../types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export function storageModeFor(user: User | null): StorageMode {
  return isSupabaseConfigured && user ? "supabase" : "local";
}

export { isSupabaseConfigured };
