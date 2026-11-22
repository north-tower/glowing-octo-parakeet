"use client";

import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";
import { ZONES } from "@/lib/nakuru/data/zones";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { IconCheck } from "@/components/app/icons/LineIcons";

type Props = {
  open: boolean;
  area: string;
  lang: LandingLang;
  onClose: () => void;
  onSelect: (zone: string) => void;
  variant?: "sheet" | "popover";
  anchorRef?: RefObject<HTMLElement | null>;
  nakuruOnly?: boolean;
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

const IN_ZONE = Object.keys(ZONES).filter((z) => !z.startsWith("Outside"));
const OUTSIDE = Object.keys(ZONES).find((z) => z.startsWith("Outside"));

function ZoneOptions({
  area,
  lang,
  onSelect,
  onClose,
  nakuruOnly,
}: {
  area: string;
  lang: LandingLang;
  onSelect: (zone: string) => void;
  onClose: () => void;
  nakuruOnly?: boolean;
}) {
  const titleId = useId();
  const showOutside = Boolean(OUTSIDE) && !nakuruOnly;
  return (
    <>
      <h2 id={titleId} className="pwa-sheet-title">
        {nakuruOnly
          ? lang === "sw"
            ? "Eneo la duka"
            : "Shop area"
          : homeCopy("zoneSheetTitle", lang)}
      </h2>
      <ul
        className="zone-sheet-list"
        role="listbox"
        aria-label={homeCopy("zoneSheetTitle", lang)}
      >
        {IN_ZONE.map((z) => {
          const selected = z === area;
          return (
            <li key={z} role="none">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={`zone-sheet-row${selected ? " is-selected" : ""}`}
                onClick={() => {
                  onSelect(z);
                  onClose();
                }}
              >
                <span className="zone-sheet-label">{z}</span>
                {selected ? (
                  <span className="zone-sheet-check" aria-hidden>
                    <IconCheck size={20} />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {showOutside && OUTSIDE ? (
        <>
          <div className="zone-sheet-divider" role="separator" />
          <button
            type="button"
            className={`zone-sheet-row zone-sheet-row--waitlist${
              area === OUTSIDE ? " is-selected" : ""
            }`}
            onClick={() => {
              onSelect(OUTSIDE);
              onClose();
            }}
          >
            <span className="zone-sheet-label">
              <span className="zone-sheet-wait-name">{OUTSIDE}</span>
              <span className="zone-sheet-wait-hint m">
                {homeCopy("zoneWaitlistHint", lang)}
              </span>
            </span>
            {area === OUTSIDE ? (
              <span className="zone-sheet-check" aria-hidden>
                <IconCheck size={20} />
              </span>
            ) : null}
          </button>
        </>
      ) : null}
    </>
  );
}

export function ZoneSheet({
  open,
  area,
  lang,
  onClose,
  onSelect,
  variant = "sheet",
  anchorRef,
  nakuruOnly,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragging = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!open) return;
    const prev = variant === "sheet" ? document.body.style.overflow : "";
    if (variant === "sheet") document.body.style.overflow = "hidden";
  const panel = sheetRef.current;
    const firstBtn = panel?.querySelector<HTMLElement>("button");
    firstBtn?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (panel) trapFocus(panel, e);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      if (variant === "sheet") document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, variant]);

  useEffect(() => {
    if (!open || variant !== "popover" || !anchorRef?.current || !sheetRef.current) {
      return;
    }
    const anchor = anchorRef.current;
    const panel = sheetRef.current;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      panel.style.top = `${r.bottom + 8 + window.scrollY}px`;
      panel.style.left = `${Math.min(
        r.left + window.scrollX,
        window.innerWidth - 360 - 16,
      )}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, variant, anchorRef]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? 0;
    dragging.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const endY = e.changedTouches[0]?.clientY ?? 0;
    if (endY - startY.current > 72) onClose();
  };

  if (!open) return null;

  const dismissLabel = lang === "sw" ? "Funga" : "Close";

  if (variant === "popover") {
    return (
      <div className="zone-popover-root" aria-hidden={false}>
        <button
          type="button"
          className="zone-popover-backdrop"
          aria-label={dismissLabel}
          onClick={onClose}
        />
        <div
          ref={sheetRef}
          className="zone-popover"
          role="dialog"
          aria-modal="true"
        >
          <ZoneOptions
            area={area}
            lang={lang}
            onSelect={onSelect}
            onClose={onClose}
            nakuruOnly={nakuruOnly}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pwa-sheet-root zone-sheet-root" aria-hidden={false}>
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label={dismissLabel}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`pwa-sheet zone-sheet${reduced ? " pwa-sheet--reduced" : ""}`}
        role="dialog"
        aria-modal="true"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <ZoneOptions
          area={area}
          lang={lang}
          onSelect={onSelect}
          onClose={onClose}
          nakuruOnly={nakuruOnly}
        />
      </div>
    </div>
  );
}