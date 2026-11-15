"use client";

import { useLandingLang } from "@/components/landing/LandingLangContext";
import type { LandingLang } from "@/lib/nakuru/i18n";

export function LangToggle({
  className = "lang-toggle",
  ariaLabel = "Language",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const { lang, setLang } = useLandingLang();

  const onClick = (e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-lang]",
    );
    if (!btn) return;
    const next = btn.getAttribute("data-lang") as LandingLang;
    if (next === "en" || next === "sw") setLang(next);
  };

  return (
    <div
      className={className}
      role="group"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <button
        type="button"
        className={`lang-btn${lang === "en" ? " on" : ""}`}
        data-lang="en"
        aria-pressed={lang === "en" ? "true" : "false"}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn${lang === "sw" ? " on" : ""}`}
        data-lang="sw"
        aria-pressed={lang === "sw" ? "true" : "false"}
      >
        SW
      </button>
    </div>
  );
}