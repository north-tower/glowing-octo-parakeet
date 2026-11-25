"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  titleKey: HomeCopyKey;
  lang: LandingLang;
  /** Replaces default copy (e.g. zone interpolation). */
  title?: string;
  subtitle?: string;
  /** Hide the decorative title marker (browse-by-type section). */
  noMarker?: boolean;
  /** Listing rows: Tailwind title without bullet marker. */
  listingStyle?: boolean;
  seeAll?: { labelKey?: "seeAll"; onClick: () => void };
  actions?: ReactNode;
};

export function HomeSectionHeader({
  titleKey,
  lang,
  title,
  subtitle,
  noMarker,
  listingStyle,
  seeAll,
  actions,
}: Props) {
  const end = actions ? (
    <div className="home-section-hd-end">
      <div className="home-section-actions">{actions}</div>
      {seeAll ? (
        <button
          type="button"
          className="home-see-all inline-flex items-center gap-1"
          onClick={seeAll.onClick}
        >
          {homeCopy("seeAll", lang)}
          {listingStyle ? <ArrowRight size={16} aria-hidden /> : null}
        </button>
      ) : null}
    </div>
  ) : seeAll ? (
    <button
      type="button"
      className="home-see-all inline-flex items-center gap-1"
      onClick={seeAll.onClick}
    >
      {homeCopy("seeAll", lang)}
      {listingStyle ? <ArrowRight size={16} aria-hidden /> : null}
    </button>
  ) : null;

  const titleClass = listingStyle
    ? "home-section-title home-section-title--listing"
    : noMarker
      ? "home-section-title home-section-title--no-marker"
      : "home-section-title";

  return (
    <div className="home-section-hd">
      <div className="home-section-hd-copy">
        <h2 className={titleClass}>{title ?? homeCopy(titleKey, lang)}</h2>
        {subtitle ? <p className="home-section-sub">{subtitle}</p> : null}
      </div>
      {end}
    </div>
  );
}