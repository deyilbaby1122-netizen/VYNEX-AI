import type { UIMessage } from "ai";
import { getSupabaseBrowser } from "./supabase/browser";
import type { ChatMode, Conversation, ConversationDetail, StorageMode } from "./types";

export interface ChatStore {
  list(): Promise<Conversation[]>;
  get(id: string): Promise<ConversationDetail | null>;
  ensure(meta: Conversation): Promise<void>;
  syncMessages(id: string, messages: UIMessage[]): Promise<void>;
  update(
    id: string,
    patch: Partial<Pick<Conversation, "title" | "mode" | "model">>,
  ): Promise<void>;
  remove(id: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Local (localStorage) backend — used before Supabase is configured   */
/* ------------------------------------------------------------------ */

const LOCAL_KEY = "vynex:conversations:v1";

interface LocalRecord extends Conversation {
  messages: UIMessage[];
}

function readLocal(): LocalRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: LocalRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
  } catch {
    // Quota exceeded — history is a convenience, never a crash.
  }
}

function toRecord(
  meta: Conversation,
  messages: UIMessage[] = [],
): LocalRecord {
  return { ...meta, messages };
}

const localStore: ChatStore = {
  async list() {
    return readLocal()
      .map(({ messages: _messages, ...rest }) => rest)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
  async get(id) {
    const found = readLocal().find((record) => record.id === id);
    return found ? { ...found } : null;
  },
  async ensure(meta) {
    const records = readLocal();
    const index = records.findIndex((record) => record.id === meta.id);
    if (index === -1) {
      records.unshift(toRecord(meta));
      writeLocal(records);
    }
  },
  async syncMessages(id, messages) {
    const records = readLocal();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) return;
    records[index].messages = messages;
    records[index].updatedAt = Date.now();
    writeLocal(records);
  },
  async update(id, patch) {
    const records = readLocal();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) return;
    records[index] = {
      ...records[index],
      ...patch,
      updatedAt: Date.now(),
    };
    writeLocal(records);
  },
  async remove(id) {
    writeLocal(readLocal().filter((record) => record.id !== id));
  },
};

/* ------------------------------------------------------------------ */
/* Supabase backend — every table carries user_id + row level security */
/* ------------------------------------------------------------------ */

type Supa = NonNullable<ReturnType<typeof getSupabaseBrowser>>;

function mapRow(row: Record<string, unknown>): Conversation {
  return {
    id: String(row.id),
    title: String(row.title ?? "New chat"),
    mode: (row.mode as ChatMode) ?? "assistant",
    model: String(row.model ?? "gpt-4o"),
    createdAt: new Date(String(row.created_at)).getTime(),
    updatedAt: new Date(String(row.updated_at)).getTime(),
  };
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .slice(0, 8000);
}

async function currentUserId(supabase: Supa): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

function supabaseStore(supabase: Supa): ChatStore {
  return {
    async list() {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,title,mode,model,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },

    async get(id) {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .select("id,title,mode,model,created_at,updated_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!conversation) return null;

      const { data: rows, error: messagesError } = await supabase
        .from("messages")
        .select("id,parts,seq")
        .eq("conversation_id", id)
        .order("seq", { ascending: true });
      if (messagesError) throw messagesError;

      const messages = (rows ?? []).map((row) => row.parts as UIMessage);

      return { ...mapRow(conversation), messages };
    },

    async ensure(meta) {
      const user_id = await currentUserId(supabase);
      const { error } = await supabase.from("conversations").upsert(
        {
          id: meta.id,
          user_id,
          title: meta.title,
          mode: meta.mode,
          model: meta.model,
          created_at: new Date(meta.createdAt).toISOString(),
          updated_at: new Date(meta.updatedAt).toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: false },
      );
      if (error) throw error;
    },

    async syncMessages(id, messages) {
      const user_id = await currentUserId(supabase);

      const { data: existing, error: readError } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", id);
      if (readError) throw readError;

      const incomingIds = new Set(messages.map((message) => message.id));
      const staleIds = (existing ?? [])
        .map((row) => String(row.id))
        .filter((rowId) => !incomingIds.has(rowId));

      if (messages.length > 0) {
        const rows = messages.map((message, index) => ({
          id: message.id,
          conversation_id: id,
          user_id,
          role: message.role,
          content: textOf(message),
          parts: message as unknown as Record<string, unknown>,
          seq: index,
          created_at: new Date().toISOString(),
        }));
        const { error } = await supabase
          .from("messages")
          .upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }

      if (staleIds.length > 0) {
        const { error } = await supabase
          .from("messages")
          .delete()
          .in("id", staleIds);
        if (error) throw error;
      }

      const { error: touchError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
      if (touchError) throw touchError;
    },

    async update(id, patch) {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.mode !== undefined) payload.mode = patch.mode;
      if (patch.model !== undefined) payload.model = patch.model;
      const { error } = await supabase
        .from("conversations")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },

    async remove(id) {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

/** Resolve the store for the current session. */
export function getChatStore(mode: StorageMode): ChatStore {
  if (mode === "supabase") {
    const supabase = getSupabaseBrowser();
    if (supabase) return supabaseStore(supabase);
  }
  return localStore;
}
