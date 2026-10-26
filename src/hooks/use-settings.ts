"use client";

import { useCallback, useEffect, useState } from "react";
import { MODELS, MODES } from "@/lib/ai";
import type { AppSettings, ChatMode } from "@/lib/types";

const KEY = "vynex:settings:v1";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "auto",
  model: MODELS[0].id,
  mode: MODES[0].id,
  voiceEnabled: false,
  speakRate: 1,
};

function load(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettingsState(load());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((previous) => {
      const next = { ...previous, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Non-fatal.
      }
      return next;
    });
  }, []);

  const setModel = useCallback((model: string) => update({ model }), [update]);
  const setMode = useCallback((mode: ChatMode) => update({ mode }), [update]);
  const setLanguage = useCallback(
    (language: string) => update({ language }),
    [update],
  );

  return {
    settings,
    hydrated,
    update,
    setModel,
    setMode,
    setLanguage,
  };
}
