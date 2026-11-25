"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useAppTabletUp } from "@/lib/nakuru/use-media-query";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
};

function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== "Tab") return;
  const focusable = [
    ...container.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    ),
  ].filter((el) => !el.hasAttribute("disabled"));
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

export function HomeBottomSheet({
  open,
  title,
  onClose,
  children,
  labelledBy,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const startY = useRef(0);
  const prevFocus = useRef<HTMLElement | null>(null);
  const tabletUp = useAppTabletUp();

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = sheetRef.current;
    const first = panel?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (panel) trapFocus(panel, e);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      prevFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`pwa-sheet-root home-sheet-root${tabletUp ? " home-sheet-root--modal" : ""}`}
    >
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="pwa-sheet home-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? titleId}
        onTouchStart={(e) => {
          if (tabletUp) return;
          startY.current = e.touches[0]?.clientY ?? 0;
        }}
        onTouchEnd={(e) => {
          if (tabletUp) return;
          const endY = e.changedTouches[0]?.clientY ?? 0;
          if (endY - startY.current > 72) onClose();
        }}
      >
        {tabletUp ? null : <div className="pwa-sheet-handle" aria-hidden />}
        <h2 className="pwa-sheet-title" id={labelledBy ?? titleId}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
