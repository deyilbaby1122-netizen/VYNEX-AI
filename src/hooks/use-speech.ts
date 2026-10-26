import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Real-time voice layer built on the browser's Web Speech API.
 * - Dictation: SpeechRecognition (mic -> text)
 * - Spoken replies: SpeechSynthesis (text -> speakers)
 *
 * Both are capability-detected so unsupported browsers degrade to text-only
 * instead of throwing.
 */

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface RecognitionCtor {
  new (): RecognitionLike;
}

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as Record<string, unknown>;
  const ctor =
    (scope.SpeechRecognition as RecognitionCtor | undefined) ??
    (scope.webkitSpeechRecognition as RecognitionCtor | undefined);
  return typeof ctor === "function" ? ctor : null;
}

export function speechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

interface DictationOptions {
  lang?: string;
  onFinal?: (text: string) => void;
  onInterim?: (text: string) => void;
}

export function useDictation({
  lang = "en-US",
  onFinal,
  onInterim,
}: DictationOptions = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const wantListening = useRef(false);
  const callbacks = useRef({ onFinal, onInterim });
  callbacks.current = { onFinal, onInterim };

  useEffect(() => {
    setSupported(speechRecognitionSupported());
    return () => {
      wantListening.current = false;
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    wantListening.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    recognitionRef.current?.abort?.();
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const chunk = event.results[index];
        if (chunk.isFinal) final += chunk[0].transcript;
        else interim += chunk[0].transcript;
      }
      if (interim) callbacks.current.onInterim?.(interim);
      if (final) callbacks.current.onFinal?.(final.trim());
    };

    recognition.onerror = () => {
      wantListening.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      // Restart while the user still wants to speak (mic can end early).
      if (wantListening.current) {
        try {
          recognition.start();
          setListening(true);
        } catch {
          wantListening.current = false;
          setListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    wantListening.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch {
      wantListening.current = false;
      setListening(false);
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, start, stop, toggle };
}

interface SpeakOptions {
  rate?: number;
  lang?: string;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = speechSynthesisSupported();

  const cancel = useCallback(() => {
    if (!speechSynthesisSupported()) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, { rate = 1, lang = "en-US" }: SpeakOptions = {}) => {
      if (!speechSynthesisSupported() || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        text.replace(/[`*_#>|]/g, "").slice(0, 4000),
      );
      utterance.rate = rate;
      utterance.lang = lang;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (speechSynthesisSupported()) window.speechSynthesis.cancel();
    };
  }, []);

  return { supported, speaking, speak, cancel };
}

/** Extracts plain speakable text from a rendered assistant message. */
export function toSpeakableText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " (code omitted) ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
