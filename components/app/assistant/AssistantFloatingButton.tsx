"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { IconSparkle } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

const INTRO_KEY = "nakuru-assistant-fab-intro";

type Props = {
  lang: LandingLang;
  sheetOpen: boolean;
  onOpen: () => void;
};

function useFloatingHidden(sheetOpen: boolean) {
  const { state } = useNakuruApp();
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const [scrollHidden, setScrollHidden] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [msgThread, setMsgThread] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = (e: Event) => {
      const target = e.target;
      const y =
        target === document
          ? window.scrollY
          : target instanceof HTMLElement
            ? target.scrollTop
            : window.scrollY;
      const delta =
        target === document || target === document.documentElement
          ? y - lastY
          : 0;
      if (target === document || target === document.documentElement) {
        if (delta > 6) setScrollHidden(true);
        else if (delta < -6) setScrollHidden(false);
        lastY = y;
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => setScrollHidden(false), 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      clearTimeout(stopTimer);
    };
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOpen(inset > 120);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        setInputFocused(true);
      }
    };
    const onFocusOut = () => {
      const a = document.activeElement;
      const focused =
        a instanceof HTMLInputElement ||
        a instanceof HTMLTextAreaElement ||
        (a instanceof HTMLElement && a.isContentEditable);
      setInputFocused(focused);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const check = () => {
      setOverlayOpen(
        Boolean(
          document.querySelector(
            ".pwa-sheet-root, .inquiry-back, .zone-sheet-root",
          ),
        ),
      );
      setMsgThread(Boolean(document.querySelector(".msg-thread")));
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    const id = window.setInterval(check, 250);
    return () => {
      mo.disconnect();
      window.clearInterval(id);
    };
  }, []);

  const onSignInScreen =
    (ready && !user && state.tab === "acc" && state.acc === null) ||
    pathname?.includes("/auth") ||
    Boolean(
      typeof document !== "undefined" &&
        document.querySelector(".sign-in-card"),
    );

  const onListingDetail = Boolean(pathname?.startsWith("/app/p/"));

  const hidden =
    sheetOpen ||
    overlayOpen ||
    scrollHidden ||
    keyboardOpen ||
    inputFocused ||
    msgThread ||
    onSignInScreen ||
    onListingDetail;

  return hidden;
}

export function AssistantFloatingButton({ lang, sheetOpen, onOpen }: Props) {
  const labelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const hidden = useFloatingHidden(sheetOpen);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (hidden) return;
    try {
      if (localStorage.getItem(INTRO_KEY)) return;
    } catch {
      return;
    }
    setExpanded(true);
    const t = setTimeout(() => {
      setExpanded(false);
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [hidden]);

  const onClick = useCallback(() => {
    onOpen();
  }, [onOpen]);

  if (!mounted) return null;

  const fabLabel = homeCopy("assistantFabLabel", lang);

  return createPortal(
    <button
      ref={btnRef}
      type="button"
      id="assistant-fab"
      className={[
        "assistant-fab",
        "!max-md:bottom-20",
        expanded ? "assistant-fab--expanded" : "",
        hidden ? "assistant-fab--hidden" : "",
        reduced ? "assistant-fab--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={expanded ? labelId : undefined}
      aria-label={homeCopy("assistantFabAria", lang)}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      onClick={onClick}
    >
      <IconSparkle size={24} aria-hidden />
      {expanded ? (
        <span id={labelId} className="assistant-fab-label">
          {fabLabel}
        </span>
      ) : null}
    </button>,
    document.body,
  );
}