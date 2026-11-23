"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { ListingCard } from "@/components/app/listing/ListingCard";
import { ListingGrid } from "@/components/app/listing/ListingGrid";
import { ListingCardSkeleton } from "@/components/app/listing/ListingCardSkeleton";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import { dedupeListings } from "@/lib/nakuru/home-listing-dedupe";
import { listingToCardProps } from "@/lib/nakuru/listing-card-props";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";

type SortKey = "newest" | "price-asc" | "price-desc";

const PAGE = 12;

type Props = {
  lang: LandingLang;
  items: Listing[];
  priorRailItems?: Listing[][];
  zoneLabel: string;
  loading?: boolean;
};

export function HomePickedForYou({
  lang,
  items,
  priorRailItems = [],
  zoneLabel,
  loading,
}: Props) {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  const deduped = useMemo(
    () => dedupeListings(items, priorRailItems[0] ?? []),
    [items, priorRailItems],
  );

  const filtered = useMemo(() => {
    let rows = verifiedOnly ? deduped.filter((i) => i.v === 1) : [...deduped];
    if (sort === "price-asc") {
      rows = [...rows].sort((a, b) => a.p - b.p);
    } else if (sort === "price-desc") {
      rows = [...rows].sort((a, b) => b.p - a.p);
    }
    return rows;
  }, [deduped, verifiedOnly, sort]);

  const slice = filtered.slice(0, visible);
  const sortLabelKey: Record<SortKey, HomeCopyKey> = {
    newest: "pickedSortNewest",
    "price-asc": "pickedSortPriceLow",
    "price-desc": "pickedSortPriceHigh",
  };

  if (!deduped.length && !loading) return null;

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((n) => n + PAGE);
      setLoadingMore(false);
    }, 280);
  };

  return (
    <section className="col-span-full mt-10">
      <div className="mb-4">
        <HomeSectionHeader titleKey="pickedForYou" lang={lang} listingStyle noMarker />
      </div>
      <div
        className="home-picked-filters"
        role="toolbar"
        aria-label={homeCopy("pickedFiltersAria", lang)}
      >
        <button
          type="button"
          className={`home-filter-chip${!verifiedOnly ? " on" : ""}`}
          aria-pressed={!verifiedOnly}
          onClick={() => setVerifiedOnly(false)}
        >
          {homeCopy("pickedFilterAll", lang)}
        </button>
        <button
          type="button"
          className={`home-filter-chip${verifiedOnly ? " on" : ""}`}
          aria-pressed={verifiedOnly}
          onClick={() => setVerifiedOnly((v) => !v)}
        >
          {homeCopy("pickedFilterVerified", lang)}
        </button>
        <div className="home-sort-wrap">
          <button
            type="button"
            className="home-filter-chip"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            onClick={() => setSortOpen((o) => !o)}
          >
            {homeCopy(sortLabelKey[sort], lang)}
            <ChevronDown size={18} aria-hidden />
          </button>
          {sortOpen ? (
            <div className="home-sort-menu" role="listbox">
              {(["newest", "price-asc", "price-desc"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={sort === key}
                  className={sort === key ? "on" : undefined}
                  onClick={() => {
                    setSort(key);
                    setSortOpen(false);
                  }}
                >
                  {homeCopy(sortLabelKey[key], lang)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <span className="home-filter-count">
          {homeCopy("pickedResultCount", lang).replace(
            "{n}",
            String(filtered.length),
          )}
        </span>
      </div>
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
              priorityImage={i < 2}
            />
          ))}
        </ListingGrid>
      ) : (
        <p className="m">{homeCopy("pickedEmpty", lang)}</p>
      )}
      {visible < filtered.length ? (
        <button
          type="button"
          className="btn s home-load-more mx-auto mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={loadingMore}
          onClick={loadMore}
        >
          {loadingMore ? (
            <Loader2 size={18} className="animate-spin" aria-hidden />
          ) : null}
          {homeCopy("pickedLoadMore", lang)}
        </button>
      ) : null}
    </section>
  );
}