import type { GeneratedImage, StorageMode } from "./types";
import { getSupabaseBrowser } from "./supabase/browser";
import { uid } from "./utils";

const LOCAL_KEY = "vynex:images:v1";

export interface ImageStore {
  list(): Promise<GeneratedImage[]>;
  add(image: Omit<GeneratedImage, "id" | "createdAt">): Promise<GeneratedImage>;
  remove(id: string): Promise<void>;
}

function readLocal(): GeneratedImage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as GeneratedImage[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: GeneratedImage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    // Best effort only.
  }
}

const localStore: ImageStore = {
  async list() {
    return readLocal().sort((a, b) => b.createdAt - a.createdAt);
  },
  async add(input) {
    const image: GeneratedImage = {
      ...input,
      id: uid("img_"),
      createdAt: Date.now(),
    };
    writeLocal([image, ...readLocal()].slice(0, 60));
    return image;
  },
  async remove(id) {
    writeLocal(readLocal().filter((image) => image.id !== id));
  },
};

function supabaseStore(): ImageStore {
  const supabase = getSupabaseBrowser();
  if (!supabase) return localStore;

  return {
    async list() {
      const { data, error } = await supabase
        .from("generated_images")
        .select("id,prompt,model,size,data_url,created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: String(row.id),
        prompt: String(row.prompt),
        model: String(row.model),
        size: String(row.size),
        dataUrl: String(row.data_url),
        createdAt: new Date(String(row.created_at)).getTime(),
      }));
    },
    async add(input) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const image: GeneratedImage = {
        ...input,
        id: uid("img_"),
        createdAt: Date.now(),
      };
      const { error } = await supabase.from("generated_images").insert({
        id: image.id,
        user_id: user.id,
        prompt: image.prompt,
        model: image.model,
        size: image.size,
        data_url: image.dataUrl,
        created_at: new Date(image.createdAt).toISOString(),
      });
      if (error) throw error;
      return image;
    },
    async remove(id) {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  };
}

export function getImageStore(mode: StorageMode): ImageStore {
  return mode === "supabase" ? supabaseStore() : localStore;
}
