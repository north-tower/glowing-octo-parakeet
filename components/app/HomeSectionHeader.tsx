"use client";

import type { ReactNode } from "react";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  titleKey: HomeCopyKey;
  lang: LandingLang;
  /** Replaces default copy (e.g. zone interpolation). */
  title?: string;
  /** Hide the decorative title marker (browse-by-type section). */
  noMarker?: boolean;
  seeAll?: { labelKey?: "seeAll"; onClick: () => void };
  actions?: ReactNode;
};

export function HomeSectionHeader({
  titleKey,
  lang,
  title,
  noMarker,
  seeAll,
  actions,
}: Props) {
  const end = actions ? (
    <div className="home-section-hd-end">
      <div className="home-section-actions">{actions}</div>
      {seeAll ? (
        <button
          type="button"
          className="home-see-all"
          onClick={seeAll.onClick}
        >
          {homeCopy("seeAll", lang)}
        </button>
      ) : null}
    </div>
  ) : seeAll ? (
    <button type="button" className="home-see-all" onClick={seeAll.onClick}>
      {homeCopy("seeAll", lang)}
    </button>
  ) : null;

  return (
    <div className="home-section-hd">
      <h2
        className={
          noMarker
            ? "home-section-title home-section-title--no-marker"
            : "home-section-title"
        }
      >
        {title ?? homeCopy(titleKey, lang)}
      </h2>
      {end}
    </div>
  );
}