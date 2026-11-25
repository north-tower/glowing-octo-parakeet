"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { FilterBar } from "@/components/app/home/FilterBar";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { ListingCard } from "@/components/app/listing/ListingCard";
import { ListingGrid } from "@/components/app/listing/ListingGrid";
import { ListingCardSkeleton } from "@/components/app/listing/ListingCardSkeleton";
import { ListingsEmpty } from "@/components/app/catalog/ListingsStates";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { dedupeListings } from "@/lib/nakuru/home-listing-dedupe";
import { applyHomeFilters, type HomeFilters } from "@/lib/nakuru/home-filters";
import { listingToCardProps } from "@/lib/nakuru/listing-card-props";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";

const PAGE = 12;

type Props = {
  lang: LandingLang;
  items: Listing[];
  priorRailItems?: Listing[][];
  zoneLabel: string;
  loading?: boolean;
  filters: HomeFilters;
  onFilters: (patch: Partial<HomeFilters>) => void;
  onClearFilters: () => void;
  onZone?: (zone: string) => void;
  onBrowseCategories: () => void;
};

export function MoreToExplore({
  lang,
  items,
  priorRailItems = [],
  zoneLabel,
  loading,
  filters,
  onFilters,
  onClearFilters,
  onZone,
  onBrowseCategories,
}: Props) {
  const [visible, setVisible] = useState(PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const deduped = useMemo(
    () => dedupeListings(items, priorRailItems.flat()),
    [items, priorRailItems],
  );

  const filtered = useMemo(
    () => applyHomeFilters(deduped, filters, zoneLabel),
    [deduped, filters, zoneLabel],
  );

  useEffect(() => {
    setVisible(PAGE);
  }, [filters]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= filtered.length) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loadingMore) return;
        setLoadingMore(true);
        window.setTimeout(() => {
          setVisible((n) => n + PAGE);
          setLoadingMore(false);
        }, 220);
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, loadingMore, visible]);

  const slice = filtered.slice(0, visible);

  if (!deduped.length && !loading) return null;

  return (
    <section className="more-explore">
      <HomeSectionHeader
        titleKey="moreToExplore"
        lang={lang}
        listingStyle
        noMarker
      />
      <div className="more-explore-layout">
      <FilterBar
        lang={lang}
        filters={filters}
        resultCount={filtered.length}
        zone={zoneLabel}
        onChange={onFilters}
        onZone={onZone}
        onClear={onClearFilters}
      />
      <div className="more-explore-main">
      {loading ? (
        <ListingGrid>
          {Array.from({ length: 8 }, (_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </ListingGrid>
      ) : slice.length ? (
        <ListingGrid>
          {slice.map((item, i) => (
            <ListingCard
              key={String(item.id)}
              {...listingToCardProps(item, lang, zoneLabel)}
              lang={lang}
              variant="grid"
              priorityImage={false}
            />
          ))}
        </ListingGrid>
      ) : (
        <ListingsEmpty
          lang={lang}
          variant="filter"
          onClearFilters={onClearFilters}
          onBrowseCategories={onBrowseCategories}
        />
      )}
      {visible < filtered.length ? (
        <>
          <div ref={sentinelRef} className="more-explore-sentinel" />
          <button
            type="button"
            className="btn s home-load-more"
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              window.setTimeout(() => {
                setVisible((n) => n + PAGE);
                setLoadingMore(false);
              }, 180);
            }}
          >
            {loadingMore ? (
              <Loader2 size={18} className="load-spin" aria-hidden />
            ) : null}
            {homeCopy("loadMoreFallback", lang)}
          </button>
        </>
      ) : null}
      </div>
      </div>
    </section>
  );
}
