import type { AssistantContext, AssistantEvent, AssistantMessage } from "./types";

export interface AssistantProvider {
  send(
    messages: AssistantMessage[],
    context: AssistantContext,
    signal?: AbortSignal,
  ): AsyncIterable<AssistantEvent>;
}