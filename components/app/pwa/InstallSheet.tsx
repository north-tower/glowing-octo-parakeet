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
    if (platform === "android-chromium" && hasNativePrompt) {
      await onNativeInstall();
      return;
    }
    onClose();
  }, [hasNativePrompt, onClose, onNativeInstall, platform]);

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
        className={`pwa-sheet${reduced ? " pwa-sheet--reduced" : ""}`}
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

        {platform === "in-app" ? (
          <div className="pwa-sheet-body">
            <p className="t">{t("inAppTitle")}</p>
            <ol className="pwa-steps">
              <li>{t("inAppStep1")}</li>
              <li>{t("inAppStep2")}</li>
            </ol>
            <button type="button" className="btn full" onClick={() => void copyLink()}>
              {t("copyLink")}
            </button>
          </div>
        ) : platform === "ios" ? (
          <IosSteps t={t} />
        ) : platform === "generic" ? (
          <div className="pwa-sheet-body">
            <p className="t">{t("genericTitle")}</p>
            <p className="m">{t("genericBody")}</p>
          </div>
        ) : (
          <AndroidHint t={t} hasNativePrompt={hasNativePrompt} />
        )}

        {platform === "android-chromium" && hasNativePrompt ? (
          <button
            type="button"
            className="btn full"
            style={{ marginTop: 12 }}
            onClick={() => void onInstallPrimary()}
          >
            {t("installBtn")}
          </button>
        ) : null}

        <button
          type="button"
          className="btn full o"
          style={{ marginTop: 8 }}
          onClick={onClose}
        >
          {t("dismissSheet")}
        </button>
      </div>
    </div>
  );
}

function AndroidHint({
  t,
  hasNativePrompt,
}: {
  t: Props["t"];
  hasNativePrompt: boolean;
}) {
  if (hasNativePrompt) {
    return (
      <p className="m" style={{ marginBottom: 8 }}>
        {t("installCardBody")}
      </p>
    );
  }
  return (
    <div className="pwa-sheet-body">
      <p className="t">{t("genericTitle")}</p>
      <p className="m">{t("genericBody")}</p>
    </div>
  );
}

function IosSteps({ t }: { t: Props["t"] }) {
  return (
    <ol className="pwa-steps pwa-steps--ios">
      <li>
        <span className="pwa-step-num">1</span>
        <span>{t("iosStep1")}</span>
        <IosShareHint />
      </li>
      <li>
        <span className="pwa-step-num">2</span>
        <span>{t("iosStep2")}</span>
      </li>
      <li>
        <span className="pwa-step-num">3</span>
        <span>{t("iosStep3")}</span>
      </li>
    </ol>
  );
}

function IosShareHint() {
  return (
    <svg
      className="pwa-ios-arrow"
      viewBox="0 0 120 48"
      width="120"
      height="48"
      aria-hidden
    >
      <path
        d="M8 8 L8 36 L48 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="44,30 52,36 44,42" fill="currentColor" />
      <rect
        x="70"
        y="20"
        width="40"
        height="24"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M82 32 L90 24 L98 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="90" y1="24" x2="90" y2="38" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}