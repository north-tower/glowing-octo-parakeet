"use client";

import { BrowseStyleTileButton } from "@/components/app/category/browse/BrowseStyleTile";
import { popularLucideForTopcIndex } from "@/components/app/category/browse/popular-lucide";
import { FEAT, TOPC } from "@/lib/nakuru/data/constants";
import { homeCopy, homeTopCategoryLabel } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  onCategory: (index: number) => void;
  onSeeAll: () => void;
};

export function HomeCategoryStrip({ lang, onCategory, onSeeAll }: Props) {
  return (
    <div className="home-cat-strip-wrap">
      <div className="home-cat-strip-fade home-cat-strip-fade--start" aria-hidden />
      <div
        className="home-cat-strip"
        role="list"
        aria-label={homeCopy("topCategories", lang)}
      >
        {FEAT.map((k) => {
          const t = TOPC[k]!;
          const visual = popularLucideForTopcIndex(k);
          return (
            <div key={k} className="home-cat-strip-item" role="listitem">
              <BrowseStyleTileButton
                icon={visual.icon}
                tint={visual.tint}
                label={
                  t[3] ? homeTopCategoryLabel(t[3], lang) : t[1]
                }
                onActivate={() => onCategory(k)}
              />
            </div>
          );
        })}
        <button
          type="button"
          className="home-cat-strip-see"
          onClick={onSeeAll}
        >
          {homeCopy("seeAll", lang)}
        </button>
      </div>
      <div className="home-cat-strip-fade home-cat-strip-fade--end" aria-hidden />
    </div>
  );
}