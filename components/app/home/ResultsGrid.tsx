"use client";

import { FilterBar } from "@/components/app/home/FilterBar";
import { ListingCard } from "@/components/app/listing/ListingCard";
import { ListingGrid } from "@/components/app/listing/ListingGrid";
import { ListingCardSkeleton } from "@/components/app/listing/ListingCardSkeleton";
import { ListingsEmpty } from "@/components/app/catalog/ListingsStates";
import { applyHomeFilters, type HomeFilters } from "@/lib/nakuru/home-filters";
import { listingToCardProps } from "@/lib/nakuru/listing-card-props";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";
import { useMemo } from "react";

type Props = {
  lang: LandingLang;
  items: Listing[];
  loading: boolean;
  error: string | null;
  zoneLabel: string;
  filters: HomeFilters;
  query: string;
  cat: string;
  onFilters: (patch: Partial<HomeFilters>) => void;
  onClearFilters: () => void;
  onZone?: (zone: string) => void;
  onBrowseCategories: () => void;
};

export function ResultsGrid({
  lang,
  items,
  loading,
  error,
  zoneLabel,
  filters,
  query,
  cat,
  onFilters,
  onClearFilters,
  onZone,
  onBrowseCategories,
}: Props) {
  const filtered = useMemo(
    () => applyHomeFilters(items, filters, zoneLabel),
    [items, filters, zoneLabel],
  );

  const emptyVariant = query.trim()
    ? "search"
    : cat !== "all" || filters.verified || filters.type
      ? "filter"
      : "default";

  return (
    <div className="results-grid">
      <FilterBar
        lang={lang}
        filters={filters}
        resultCount={filtered.length}
        zone={zoneLabel}
        onChange={onFilters}
        onZone={onZone}
        onClear={onClearFilters}
      />
      {error ? <div className="err">{error}</div> : null}
      {loading ? (
        <ListingGrid>
          {Array.from({ length: 6 }, (_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </ListingGrid>
      ) : filtered.length ? (
        <ListingGrid>
          {filtered.map((item, idx) => (
            <ListingCard
              key={String(item.id)}
              {...listingToCardProps(item, lang, zoneLabel)}
              lang={lang}
              variant="grid"
              priorityImage={idx < 2}
            />
          ))}
        </ListingGrid>
      ) : (
        <ListingsEmpty
          lang={lang}
          variant={emptyVariant}
          query={query.trim() || undefined}
          onClearFilters={onClearFilters}
          onBrowseCategories={onBrowseCategories}
        />
      )}
    </div>
  );
}
