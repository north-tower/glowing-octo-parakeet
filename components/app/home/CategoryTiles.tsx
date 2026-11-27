"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { BrowseStyleTileButton } from "@/components/app/category/browse/BrowseStyleTile";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { presentationForSlug } from "@/lib/nakuru/category-presentation";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  onCategory: (slug: string) => void;
  onSeeAll: () => void;
};

export function CategoryTiles({ lang, onCategory, onSeeAll }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const { rows } = useCategories();
  const roots = useMemo(
    () =>
      rows
        .filter((r) => r.visible && r.depth === 0 && r.kind === "official")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 10),
    [rows],
  );

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
  }, [sync, roots.length]);

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
        {roots.map((row) => {
          const visual = presentationForSlug(row.slug);
          return (
            <div key={row.slug} className="cat-tiles-item" role="listitem">
              <BrowseStyleTileButton
                icon={visual.icon}
                tint={visual.tint}
                image={visual.image}
                label={row.label}
                onActivate={() => onCategory(row.slug)}
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
