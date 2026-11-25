"use client";

import { useEffect, useRef } from "react";
import { homeCategoryLabel } from "@/lib/nakuru/home-i18n";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import type { CategoryId } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";

const OFFICIAL_TAB_IDS = new Set<CategoryId>([
  "shop",
  "property",
  "cars",
  "services",
  "stays",
  "taxi",
  "rider",
]);

function directoryTabLabel(row: DirectoryCategory, lang: LandingLang): string {
  if (row.kind === "official" && OFFICIAL_TAB_IDS.has(row.slug as CategoryId)) {
    return homeCategoryLabel(row.slug, lang);
  }
  return row.label;
}

type Props = {
  lang: LandingLang;
  cat: string;
  rows: DirectoryCategory[];
  onSelect: (slug: string) => void;
};

export function CategoryTabs({ lang, cat, rows, onSelect }: Props) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const officialTabs = rows.filter((r) => r.kind === "official");
  const communityTabs = rows.filter((r) => r.kind === "community");

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const active = tabs.querySelector<HTMLElement>(".tb.on");
    if (!active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    active.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    });
  }, [cat]);

  return (
    <div className="tabs-scroll cat-tabs">
      <div className="tabs" id="tabs" ref={tabsRef} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={cat === "all"}
          className={`tb${cat === "all" ? " on" : ""}`}
          onClick={() => onSelect("all")}
        >
          {homeCategoryLabel("all", lang)}
        </button>
        {[...officialTabs, ...communityTabs].map((row) => {
          const label = directoryTabLabel(row, lang);
          return (
            <button
              key={row.slug}
              type="button"
              role="tab"
              aria-selected={cat === row.slug}
              className={`tb${cat === row.slug ? " on" : ""}`}
              onClick={() => onSelect(row.slug)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
