import type { AssistantProvider } from "./provider";
import type { AssistantContext, AssistantEvent, AssistantMessage } from "./types";

async function* parseNdjson(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<AssistantEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        const ev = JSON.parse(line) as AssistantEvent;
        yield ev;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const remoteAssistantProvider: AssistantProvider = {
  async *send(messages, context, signal) {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
      signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      yield {
        type: "error",
        message: text || `Assistant unavailable (${res.status})`,
      };
      yield { type: "done" };
      return;
    }
    yield* parseNdjson(res.body, signal);
  },
};