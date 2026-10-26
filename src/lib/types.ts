export type ChatMode = "assistant" | "code" | "translate";

export type StorageMode = "supabase" | "local";

export interface Conversation {
  id: string;
  title: string;
  mode: ChatMode;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationDetail extends Conversation {
  messages: unknown[];
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  model: string;
  size: string;
  dataUrl: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  language: string;
}

export interface AppSettings {
  language: string;
  model: string;
  mode: ChatMode;
  voiceEnabled: boolean;
  speakRate: number;
}
