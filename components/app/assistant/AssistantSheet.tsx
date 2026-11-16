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
  IconArrowUp,
  IconEllipsis,
  IconFlamingo,
  IconSquare,
  IconX,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantPart,
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
};

function partitionParts(parts: AssistantPart[]) {
  const main: AssistantPart[] = [];
  const quick: AssistantPart[] = [];
  for (const p of parts) {
    if (p.type === "quickReplies") quick.push(p);
    else main.push(p);
  }
  return { main, quick };
}

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
      requestAnimationFrame(() => {
        const ta = composerRef.current;
        const log = logRef.current;
        if (log) log.scrollTop = log.scrollHeight;
        if (!ta) return;
        const vv = window.visualViewport;
        const keyboardInset = vv
          ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
          : 0;
        if (keyboardInset < 80) ta.focus();
      });
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
          <div className="assistant-sheet-head-actions">
            <div className="assistant-sheet-menu-wrap">
              <button
                type="button"
                className="assistant-menu-btn"
                aria-label={homeCopy("assistantMenuAria", lang)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <IconEllipsis size={22} />
              </button>
              {menuOpen ? (
                <div className="assistant-menu-pop" role="menu">
                  <button
                    type="button"
                    role="menuitem"
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
            <button
              type="button"
              className="assistant-menu-btn assistant-close-btn"
              aria-label={homeCopy("assistantCloseAria", lang)}
              onClick={onClose}
            >
              <IconX size={22} />
            </button>
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

          {messages.map((msg) => {
            const { main, quick } = partitionParts(msg.parts);
            return (
              <article
                key={msg.id}
                className={`assistant-bubble assistant-bubble--${msg.role}`}
              >
                {msg.role === "assistant" ? (
                  <span className="assistant-avatar" aria-hidden>
                    <IconFlamingo size={18} />
                  </span>
                ) : null}
                {msg.role === "assistant" ? (
                  <div className="assistant-bubble-stack">
                    <div className="assistant-bubble-inner">
                      <AssistantMessageParts
                        parts={main}
                        lang={lang}
                        onQuickReply={onQuickReply}
                        onRunAction={onRunAction}
                        pendingConfirm={pendingConfirm}
                        onConfirmPending={onConfirmPending}
                      />
                    </div>
                    {quick.length ? (
                      <AssistantMessageParts
                        parts={quick}
                        lang={lang}
                        onQuickReply={onQuickReply}
                        onRunAction={onRunAction}
                        pendingConfirm={pendingConfirm}
                        onConfirmPending={onConfirmPending}
                      />
                    ) : null}
                  </div>
                ) : (
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
                )}
              </article>
            );
          })}

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
              const desktop = window.matchMedia(
                "(pointer: fine) and (min-width: 768px)",
              ).matches;
              if (e.key === "Enter" && !e.shiftKey && desktop) {
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
              <IconSquare size={18} />
            </button>
          ) : (
            <button
              type="submit"
              className="assistant-send-btn"
              disabled={!draft.trim()}
              aria-label={homeCopy("assistantSend", lang)}
            >
              <IconArrowUp size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}