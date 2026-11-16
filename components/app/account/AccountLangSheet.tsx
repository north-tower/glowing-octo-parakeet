"use client";

import { useEffect, useId, useRef } from "react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { IconCheck } from "@/components/app/icons/LineIcons";

type Props = {
  open: boolean;
  lang: LandingLang;
  onClose: () => void;
  onSelect: (lang: LandingLang) => void;
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

export function AccountLangSheet({ open, lang, onClose, onSelect }: Props) {
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
    const firstBtn = sheet?.querySelector<HTMLElement>("button");
    firstBtn?.focus();

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
  const options: { id: LandingLang; labelKey: "accLanguageEn" | "accLanguageSw" }[] = [
    { id: "en", labelKey: "accLanguageEn" },
    { id: "sw", labelKey: "accLanguageSw" },
  ];

  return (
    <div className="pwa-sheet-root acc-lang-sheet-root" aria-hidden={false}>
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label={dismissLabel}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`pwa-sheet acc-lang-sheet${reduced ? " pwa-sheet--reduced" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <h2 id={titleId} className="pwa-sheet-title">
          {homeCopy("accLanguageSheetTitle", lang)}
        </h2>
        <div
          className="acc-lang-segment"
          role="group"
          aria-label={homeCopy("accLanguageSheetTitle", lang)}
        >
          {options.map((opt) => {
            const on = lang === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`acc-lang-segment-btn${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() => {
                  onSelect(opt.id);
                  onClose();
                }}
              >
                {homeCopy(opt.labelKey, lang)}
                {on ? (
                  <span className="acc-lang-segment-check" aria-hidden>
                    <IconCheck size={18} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}