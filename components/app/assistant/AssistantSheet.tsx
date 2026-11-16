"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  IconFlamingo,
  IconMessageCircle,
  IconSparkle,
  IconX,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantScreen,
} from "@/lib/assistant/types";
import { AssistantMessageParts } from "@/components/app/assistant/AssistantMessageParts";
import { suggestedPrompts } from "@/lib/assistant/suggestions";
import { getAssistantMode } from "@/lib/assistant";

type Props = {
  open: boolean;
  lang: LandingLang;
  screen: AssistantScreen;
  messages: AssistantMessage[];
  streaming: boolean;
  offline: boolean;
  pendingConfirm: AssistantAction | null;
  onClose: () => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
  onQuickReply: (id: string) => void;
  onRunAction: (
    action: AssistantAction,
    requiresConfirm?: boolean,
    label?: string,
  ) => void;
  onConfirmPending: () => void;
  error?: string | null;
  onRetry?: () => void;
  initialPrompt?: string;
};

function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== "Tab") return;
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export function AssistantSheet({
  open,
  lang,
  screen,
  messages,
  streaming,
  offline,
  pendingConfirm,
  onClose,
  onSend,
  onStop,
  onClear,
  onQuickReply,
  onRunAction,
  onConfirmPending,
  error,
  onRetry,
  initialPrompt,
}: Props) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [kbOffset, setKbOffset] = useState(0);
  const startY = useRef(0);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    composerRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (sheet) trapFocus(sheet, e);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const inset = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop,
      );
      setKbOffset(inset);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, [open]);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => {
    if (open && initialPrompt) setDraft(initialPrompt);
  }, [open, initialPrompt]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? 0;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0]?.clientY ?? 0;
    if (endY - startY.current > 88) onClose();
  };

  const submit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const text = draft.trim();
      if (!text || streaming) return;
      onSend(text);
      setDraft("");
    },
    [draft, onSend, streaming],
  );

  if (!open) return null;

  const prompts = suggestedPrompts(screen, lang);
  const remote = getAssistantMode() === "remote";

  return (
    <div className="pwa-sheet-root assistant-sheet-root" aria-hidden={false}>
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label={lang === "sw" ? "Funga" : "Close"}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`pwa-sheet assistant-sheet${reduced ? " pwa-sheet--reduced" : ""}`}
        style={{
          maxHeight: "92dvh",
          paddingBottom: `calc(12px + ${kbOffset}px + env(safe-area-inset-bottom, 0px))`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <header className="assistant-sheet-head">
          <span className="assistant-sheet-mark" aria-hidden>
            <IconFlamingo size={22} />
          </span>
          <div className="assistant-sheet-titles">
            <h2 id={titleId} className="pwa-sheet-title assistant-sheet-title">
              {homeCopy("assistantTitle", lang)}
            </h2>
            <span className="assistant-demo-chip">
              {homeCopy("assistantDemoChip", lang)}
            </span>
          </div>
          <div className="assistant-sheet-menu-wrap">
            <button
              type="button"
              className="assistant-menu-btn"
              aria-label={homeCopy("assistantMenuAria", lang)}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <IconMessageCircle size={22} />
            </button>
            {menuOpen ? (
              <div className="assistant-menu-pop">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onClear();
                  }}
                >
                  {homeCopy("assistantClear", lang)}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div
          ref={logRef}
          className="assistant-log"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {!messages.length ? (
            <div className="assistant-empty">
              <p className="assistant-empty-greet">
                {homeCopy("assistantEmptyGreeting", lang)}
              </p>
              <div className="assistant-quick-replies">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="assistant-quick-reply"
                    onClick={() => onSend(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`assistant-bubble assistant-bubble--${msg.role}`}
            >
              {msg.role === "assistant" ? (
                <span className="assistant-avatar" aria-hidden>
                  <IconFlamingo size={18} />
                </span>
              ) : null}
              <div className="assistant-bubble-inner">
                <AssistantMessageParts
                  parts={msg.parts}
                  lang={lang}
                  onQuickReply={onQuickReply}
                  onRunAction={onRunAction}
                  pendingConfirm={pendingConfirm}
                  onConfirmPending={onConfirmPending}
                />
              </div>
            </article>
          ))}

          {streaming ? (
            <p className="assistant-typing m" aria-live="polite">
              …
            </p>
          ) : null}

          {error ? (
            <div className="assistant-error-row">
              <span className="m">{error}</span>
              {onRetry ? (
                <button
                  type="button"
                  className="assistant-quick-reply"
                  onClick={onRetry}
                >
                  {homeCopy("assistantRetry", lang)}
                </button>
              ) : null}
            </div>
          ) : null}

          {remote && offline ? (
            <p className="assistant-offline m" role="status">
              {homeCopy("assistantOffline", lang)}
            </p>
          ) : null}
        </div>

        <form className="assistant-composer" onSubmit={submit}>
          <textarea
            ref={composerRef}
            className="assistant-composer-input"
            rows={1}
            maxLength={500}
            value={draft}
            placeholder={homeCopy("assistantPlaceholder", lang)}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            aria-label={homeCopy("assistantPlaceholder", lang)}
          />
          {streaming ? (
            <button
              type="button"
              className="assistant-send-btn"
              onClick={onStop}
              aria-label={homeCopy("assistantStop", lang)}
            >
              <IconX size={20} />
            </button>
          ) : (
            <button
              type="submit"
              className="assistant-send-btn"
              disabled={!draft.trim()}
              aria-label={homeCopy("assistantSend", lang)}
            >
              <IconSparkle size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}