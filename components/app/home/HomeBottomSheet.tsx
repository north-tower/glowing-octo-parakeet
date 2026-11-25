"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
};

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = sheetRef.current;
    const first = panel?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pwa-sheet-root home-sheet-root">
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
          startY.current = e.touches[0]?.clientY ?? 0;
        }}
        onTouchEnd={(e) => {
          const endY = e.changedTouches[0]?.clientY ?? 0;
          if (endY - startY.current > 72) onClose();
        }}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <h2 className="pwa-sheet-title" id={labelledBy ?? titleId}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
