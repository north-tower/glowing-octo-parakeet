"use client";

import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  titleKey: HomeCopyKey;
  lang: LandingLang;
  seeAll?: { labelKey?: "seeAll"; onClick: () => void };
};

export function HomeSectionHeader({ titleKey, lang, seeAll }: Props) {
  return (
    <div className="home-section-hd">
      <h2 className="home-section-title">{homeCopy(titleKey, lang)}</h2>
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
  );
}