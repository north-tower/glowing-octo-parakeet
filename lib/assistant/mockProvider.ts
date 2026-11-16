import {
  buildIntentReply,
} from "./knowledge";
import { isOutOfScopePolicyQuestion, matchIntent } from "./intent";
import {
  OUT_OF_SCOPE_REFUSAL,
} from "./policy";
import type { AssistantProvider } from "./provider";
import type {
  AssistantContext,
  AssistantEvent,
  AssistantMessage,
  AssistantPart,
} from "./types";

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function* streamText(
  text: string,
  signal?: AbortSignal,
): AsyncGenerator<AssistantEvent> {
  if (reducedMotion()) {
    yield { type: "text-delta", text };
    return;
  }
  const chunk = Math.max(8, Math.min(24, Math.floor(text.length / 6)));
  for (let i = 0; i < text.length; i += chunk) {
    yield { type: "text-delta", text: text.slice(i, i + chunk) };
    await sleep(20 + Math.random() * 20, signal);
  }
}

function collectParts(parts: AssistantPart[]): AssistantEvent[] {
  const events: AssistantEvent[] = [];
  for (const part of parts) {
    if (part.type === "action") {
      events.push({
        type: "action",
        action: part.action,
        requiresConfirm: part.requiresConfirm,
        label: part.label,
      });
    } else if (part.type !== "text") {
      events.push({ type: "parts", parts: [part] });
    }
  }
  return events;
}

export const mockAssistantProvider: AssistantProvider = {
  async *send(messages, context, signal) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userText =
      lastUser?.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { text: string }).text)
        .join(" ") ?? "";

    if (isOutOfScopePolicyQuestion(userText)) {
      const refusal =
        context.language === "sw"
          ? OUT_OF_SCOPE_REFUSAL.sw
          : OUT_OF_SCOPE_REFUSAL.en;
      yield* streamText(refusal, signal);
      yield { type: "done" };
      return;
    }

    const { intent } = matchIntent(userText, context);
    const { parts } = buildIntentReply(intent, context, userText);
    const textPart = parts.find((p) => p.type === "text") as
      | { text: string }
      | undefined;
    const text = textPart?.text ?? "";

    yield* streamText(text, signal);
    for (const ev of collectParts(parts.filter((p) => p.type !== "text"))) {
      yield ev;
    }
    yield { type: "done" };
  },
};