import { redactSensitiveText } from "./policy";
import type { AssistantMessage } from "./types";

const STORAGE_KEY = "nh-assistant-v1";
const MAX_STORED = 30;

export function loadStoredMessages(): AssistantMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_STORED);
  } catch {
    return [];
  }
}

export function saveStoredMessages(messages: AssistantMessage[]): void {
  if (typeof window === "undefined") return;
  const trimmed = messages.slice(-MAX_STORED).map((m) => ({
    ...m,
    parts: m.parts.map((p) => {
      if (p.type === "text") {
        return { ...p, text: redactSensitiveText(p.text) };
      }
      return p;
    }),
  }));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}

export function clearStoredMessages(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}