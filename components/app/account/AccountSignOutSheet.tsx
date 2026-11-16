"use client";

import { useEffect, useId, useRef } from "react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  open: boolean;
  lang: LandingLang;
  onClose: () => void;
  onConfirm: () => void;
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

export function AccountSignOutSheet({ open, lang, onClose, onConfirm }: Props) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    const cancelBtn = sheet?.querySelector<HTMLElement>(".acc-signout-cancel");
    cancelBtn?.focus();

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

  if (!open) return null;

  const dismissLabel = lang === "sw" ? "Funga" : "Close";

  return (
    <div className="pwa-sheet-root acc-signout-sheet-root" aria-hidden={false}>
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label={dismissLabel}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`pwa-sheet acc-signout-sheet${reduced ? " pwa-sheet--reduced" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <h2 id={titleId} className="pwa-sheet-title">
          {homeCopy("accSignOutConfirmTitle", lang)}
        </h2>
        <div className="acc-signout-actions">
          <button
            type="button"
            className="btn full acc-signout-cancel"
            onClick={onClose}
          >
            {homeCopy("accSignOutCancel", lang)}
          </button>
          <button
            type="button"
            className="btn full o acc-signout-confirm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {homeCopy("accSignOutConfirm", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}