export function dispatchAssistantOpen(source: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nh:assistant-open", { detail: { source } }),
  );
}

export function dispatchAssistantMessage(intent?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nh:assistant-message", { detail: { intent } }),
  );
}

export function dispatchAssistantAction(type: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nh:assistant-action", { detail: { type } }),
  );
}

export function dispatchAssistantFallback(reason: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nh:assistant-fallback", { detail: { reason } }),
  );
}