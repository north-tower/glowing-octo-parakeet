"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import type { InstallPlatform } from "@/lib/nakuru/pwa-engage";
import type { InstallCopyKey } from "@/lib/nakuru/pwa-install-i18n";

type Props = {
  open: boolean;
  platform: InstallPlatform;
  hasNativePrompt: boolean;
  onClose: () => void;
  onNativeInstall: () => Promise<boolean>;
  t: (key: InstallCopyKey) => string;
  toast: (msg: string) => void;
};

function sheetHintKey(platform: InstallPlatform): InstallCopyKey {
  if (platform === "ios") return "sheetHintIos";
  if (platform === "in-app") return "sheetHintInApp";
  return "sheetHintGeneric";
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

export function InstallSheet({
  open,
  platform,
  hasNativePrompt,
  onClose,
  onNativeInstall,
  t,
  toast,
}: Props) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragging = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showNativeInstall = hasNativePrompt;

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

  const onInstallPrimary = useCallback(async () => {
    if (showNativeInstall) {
      await onNativeInstall();
      return;
    }
    onClose();
  }, [onClose, onNativeInstall, showNativeInstall]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t("copied"));
    } catch {
      toast(t("copyLink"));
    }
  }, [t, toast]);

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

  const hint =
    showNativeInstall ? t("installCardBody") : t(sheetHintKey(platform));

  return (
    <div className="pwa-sheet-root" aria-hidden={false}>
      <button
        type="button"
        className="pwa-sheet-backdrop"
        aria-label={t("dismissSheet")}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`pwa-sheet pwa-sheet--compact${reduced ? " pwa-sheet--reduced" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="pwa-sheet-handle" aria-hidden />
        <h2 id={titleId} className="pwa-sheet-title">
          {t("sheetTitle")}
        </h2>
        <p className="m pwa-sheet-hint">{hint}</p>

        {showNativeInstall ? (
          <button
            type="button"
            className="btn full"
            onClick={() => void onInstallPrimary()}
          >
            {t("installBtn")}
          </button>
        ) : null}

        {platform === "in-app" ? (
          <button
            type="button"
            className="btn full o"
            style={{ marginTop: showNativeInstall ? 8 : 0 }}
            onClick={() => void copyLink()}
          >
            {t("copyLink")}
          </button>
        ) : null}

        <button
          type="button"
          className={`btn full${showNativeInstall || platform === "in-app" ? " o" : ""}`}
          style={{ marginTop: 8 }}
          onClick={onClose}
        >
          {t("dismissSheet")}
        </button>
      </div>
    </div>
  );
}