"use client";

import { BrowseStyleTileButton } from "@/components/app/category/browse/BrowseStyleTile";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { popularLucideForTopcIndex } from "@/components/app/category/browse/popular-lucide";
import { FEAT, TOPC } from "@/lib/nakuru/data/constants";
import { homeCopy, homeTopCategoryLabel } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  onCategory: (index: number) => void;
  onSeeAll: () => void;
};

export function CategoryTiles({ lang, onCategory, onSeeAll }: Props) {
  return (
    <section className="cat-tiles">
      <HomeSectionHeader
        titleKey="browseCategories"
        lang={lang}
        listingStyle
        noMarker
        seeAll={{ onClick: onSeeAll }}
      />
      <div className="cat-tiles-scroll" role="list">
        {FEAT.map((k) => {
          const t = TOPC[k]!;
          const visual = popularLucideForTopcIndex(k);
          return (
            <div key={k} className="cat-tiles-item" role="listitem">
              <BrowseStyleTileButton
                icon={visual.icon}
                tint={visual.tint}
                label={t[3] ? homeTopCategoryLabel(t[3], lang) : t[1]}
                onActivate={() => onCategory(k)}
              />
            </div>
          );
        })}
      </div>
      <p className="sr-only">{homeCopy("browseCategories", lang)}</p>
    </section>
  );
}
