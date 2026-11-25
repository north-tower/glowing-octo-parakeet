"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { useMyVendorProfile } from "@/components/app/useMyVendorProfile";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  buildAssistantContext,
  inferScreenFromApp,
} from "@/lib/assistant/build-context";
import {
  clampUserInput,
  checkDemoRateLimit,
  getAssistantProvider,
  getAssistantMode,
  redactSensitiveText,
} from "@/lib/assistant";
import {
  dispatchAssistantAction,
  dispatchAssistantFallback,
  dispatchAssistantMessage,
  dispatchAssistantOpen,
} from "@/lib/assistant/analytics";
import {
  actionRequiresConfirm,
  executeAssistantAction,
} from "@/lib/assistant/actions";
import { matchIntent } from "@/lib/assistant/intent";
import {
  clearStoredMessages,
  loadStoredMessages,
  saveStoredMessages,
} from "@/lib/assistant/storage";
import { quickReplyToMessage } from "@/lib/assistant/suggestions";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantPart,
  AssistantScreen,
} from "@/lib/assistant/types";
import { AssistantSheet } from "@/components/app/assistant/AssistantSheet";

export type OpenAssistantOptions = {
  screen?: AssistantScreen;
  productId?: string;
  suggestedPrompt?: string;
  source?: string;
};

type AssistantUiContextValue = {
  openAssistant: (opts?: OpenAssistantOptions) => void;
};

const AssistantUiContext = createContext<AssistantUiContextValue | null>(null);

export function useAssistantUi(): AssistantUiContextValue {
  const ctx = useContext(AssistantUiContext);
  if (!ctx) {
    throw new Error("useAssistantUi must be used within AssistantUiProvider");
  }
  return ctx;
}

function newId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = { children: ReactNode };

export function AssistantUiProvider({ children }: Props) {
  const { state, dispatch, toast } = useNakuruApp();
  const { user, ready } = useAuth();
  const { profile } = useMyVendorProfile();
  const { lang, openInstallSheet, offline } = usePwaInstall();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(() =>
    typeof window !== "undefined" ? loadStoredMessages() : [],
  );
  const [screen, setScreen] = useState<AssistantScreen>("home");
  const [productId, setProductId] = useState<string | undefined>();
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | undefined>();
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<AssistantAction | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const lastUserRef = useRef<string>("");

  const context = useMemo(
    () =>
      buildAssistantContext({
        screen,
        lang,
        state,
        productId,
        signedIn: Boolean(ready && user),
        vendor: profile
          ? { status: profile.status, verified: profile.verified }
          : null,
      }),
    [screen, lang, state, productId, ready, user, profile],
  );

  const persist = useCallback((next: AssistantMessage[]) => {
    setMessages(next);
    saveStoredMessages(next);
  }, []);

  const openAssistant = useCallback(
    (opts?: OpenAssistantOptions) => {
      const inferred =
        opts?.screen ?? inferScreenFromApp(state, pathname);
      setScreen(inferred);
      setProductId(opts?.productId ?? (pathname?.match(/\/app\/p\/([^/]+)/)?.[1]));
      setSuggestedPrompt(opts?.suggestedPrompt);
      setOpen(true);
      dispatchAssistantOpen(opts?.source ?? inferred);
    },
    [state, pathname],
  );

  const runGeneration = useCallback(
    async (history: AssistantMessage[]) => {
      const provider = getAssistantProvider();
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setStreaming(true);
      setError(null);

      const assistantId = newId();
      let textBuf = "";
      const extraParts: AssistantPart[] = [];

      try {
        for await (const ev of provider.send(history, context, ac.signal)) {
          if (ev.type === "text-delta") textBuf += ev.text;
          if (ev.type === "parts") extraParts.push(...ev.parts);
          if (ev.type === "action") {
            extraParts.push({
              type: "action",
              action: ev.action,
              label: ev.label,
              requiresConfirm: ev.requiresConfirm,
            });
          }
          if (ev.type === "error") {
            setError(ev.message);
          }
        }

        const parts: AssistantPart[] = [];
        if (textBuf) parts.push({ type: "text", text: textBuf });
        parts.push(...extraParts);

        const assistantMsg: AssistantMessage = {
          id: assistantId,
          role: "assistant",
          parts,
          createdAt: Date.now(),
        };
        persist([...history, assistantMsg]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(
            lang === "sw"
              ? "Hitilafu kidogo. Jaribu tena."
              : "Something went wrong. Try again.",
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [context, lang, persist],
  );

  const onSend = useCallback(
    (raw: string) => {
      const text = clampUserInput(redactSensitiveText(raw));
      if (!text) return;

      if (getAssistantMode() === "demo") {
        const rate = checkDemoRateLimit();
        if (!rate.ok) {
          setError(rate.message);
          return;
        }
      }

      const { intent } = matchIntent(text, context);
      dispatchAssistantMessage(intent);
      if (intent === "fallback") {
        dispatchAssistantFallback("low_score");
      }

      const userMsg: AssistantMessage = {
        id: newId(),
        role: "user",
        parts: [{ type: "text", text }],
        createdAt: Date.now(),
      };
      const next = [...messages, userMsg];
      persist(next);
      lastUserRef.current = text;
      void runGeneration(next);
    },
    [context, messages, persist, runGeneration],
  );

  const onQuickReply = useCallback(
    (idOrText: string) => {
      const text =
        idOrText.includes(" ") ? idOrText : quickReplyToMessage(idOrText, lang);
      onSend(text);
    },
    [lang, onSend],
  );

  const deps = useMemo(
    () => ({
      dispatch: dispatch as (action: {
        type: string;
        [key: string]: unknown;
      }) => void,
      router,
      openInstallSheet,
      toast,
      lang,
    }),
    [dispatch, router, openInstallSheet, toast, lang],
  );

  const onRunAction = useCallback(
    (action: AssistantAction, requiresConfirm?: boolean) => {
      if (requiresConfirm || actionRequiresConfirm(action)) {
        setPendingConfirm(action);
        return;
      }
      executeAssistantAction(action, deps);
      dispatchAssistantAction(action.type);
      setOpen(false);
    },
    [deps],
  );

  const onConfirmPending = useCallback(() => {
    if (!pendingConfirm) return;
    executeAssistantAction(pendingConfirm, deps);
    dispatchAssistantAction(pendingConfirm.type);
    setPendingConfirm(null);
    setOpen(false);
  }, [deps, pendingConfirm]);

  const onClear = useCallback(() => {
    clearStoredMessages();
    setMessages([]);
    setPendingConfirm(null);
    setError(null);
  }, []);

  const onStop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const value = useMemo(() => ({ openAssistant }), [openAssistant]);

  return (
    <AssistantUiContext.Provider value={value}>
      {children}
      <AssistantSheet
        open={open}
        lang={lang}
        screen={screen}
        messages={messages}
        streaming={streaming}
        offline={offline}
        pendingConfirm={pendingConfirm}
        onClose={() => setOpen(false)}
        onSend={onSend}
        onStop={onStop}
        onClear={onClear}
        onQuickReply={onQuickReply}
        onRunAction={onRunAction}
        onConfirmPending={onConfirmPending}
        error={error}
        onRetry={() => {
          if (lastUserRef.current) onSend(lastUserRef.current);
        }}
      />
    </AssistantUiContext.Provider>
  );
}