import { mockAssistantProvider } from "./mockProvider";
import { remoteAssistantProvider } from "./remoteProvider";
import type { AssistantProvider } from "./provider";

export type AssistantMode = "demo" | "remote";

export function getAssistantMode(): AssistantMode {
  const mode = process.env.NEXT_PUBLIC_ASSISTANT_MODE;
  return mode === "remote" ? "remote" : "demo";
}

export function getAssistantProvider(): AssistantProvider {
  return getAssistantMode() === "remote"
    ? remoteAssistantProvider
    : mockAssistantProvider;
}

export * from "./types";
export * from "./policy";
export { matchIntent } from "./intent";