"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  return (
    <section className="cat-tiles">
      <HomeSectionHeader
        titleKey="browseCategories"
        lang={lang}
        listingStyle
        noMarker
        seeAll={{ onClick: onSeeAll }}
      />
      <button
        type="button"
        className="cat-tiles-arrow cat-tiles-arrow--prev"
        aria-label="Previous categories"
        disabled={!canPrev}
        onClick={() =>
          scrollerRef.current?.scrollBy({
            left: -scrollerRef.current.clientWidth,
            behavior: "smooth",
          })
        }
      >
        <ChevronLeft size={18} aria-hidden />
      </button>
      <div className="cat-tiles-scroll" role="list" ref={scrollerRef}>
        {FEAT.slice(0, 7).map((k) => {
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
        <div className="cat-tiles-item" role="listitem">
          <BrowseStyleTileButton
            icon={LayoutGrid}
            tint="stone"
            label={homeCopy("allCategoriesTile", lang)}
            onActivate={onSeeAll}
          />
        </div>
      </div>
      <button
        type="button"
        className="cat-tiles-arrow cat-tiles-arrow--next"
        aria-label="Next categories"
        disabled={!canNext}
        onClick={() =>
          scrollerRef.current?.scrollBy({
            left: scrollerRef.current.clientWidth,
            behavior: "smooth",
          })
        }
      >
        <ChevronRight size={18} aria-hidden />
      </button>
    </section>
  );
}
