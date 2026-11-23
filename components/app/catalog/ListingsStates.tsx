"use client";

import {
  IconGrid,
  IconSearch,
  IconStore,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

export function CategoryTilesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="home-cat-grid"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ct ct-skeleton" aria-hidden>
          <span className="ct-icon" />
          <span className="ct-label" />
        </div>
      ))}
    </div>
  );
}

export function ListingsSkeleton({
  count = 4,
  className = "g2",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pc pc-skel" aria-hidden>
          <div className="pim pim--ratio-1" />
          <div className="pc-body">
            <div className="pc-title">…</div>
            <div className="pc-price">
              <span className="pc-price-kes">KES</span>
              <span className="pc-price-num">—</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export type ListingsEmptyVariant = "default" | "search" | "filter";

type ListingsEmptyProps = {
  lang: LandingLang;
  variant?: ListingsEmptyVariant;
  query?: string;
  onClearFilters?: () => void;
  onBrowseCategories?: () => void;
  /** Extra vertical space when this is the main content (search / browse). */
  spacious?: boolean;
};

export function ListingsEmpty({
  lang,
  variant = "default",
  query,
  onClearFilters,
  onBrowseCategories,
  spacious = variant !== "default",
}: ListingsEmptyProps) {
  const titleKey =
    variant === "search"
      ? "listingsEmptySearchTitle"
      : variant === "filter"
        ? "listingsEmptyFilterTitle"
        : "listingsEmptyTitle";
  const bodyKey =
    variant === "search"
      ? "listingsEmptySearchBody"
      : variant === "filter"
        ? "listingsEmptyFilterBody"
        : "listingsEmptyBody";
  const Icon =
    variant === "search"
      ? IconSearch
      : variant === "filter"
        ? IconGrid
        : IconStore;

  const showClear = Boolean(onClearFilters && variant !== "default");
  const showBrowse = Boolean(onBrowseCategories);

  return (
    <div
      className={`listings-empty listings-empty--${variant}${spacious ? " listings-empty--spacious" : ""}`}
      role="status"
    >
      <div className="listings-empty-scene" aria-hidden>
        {variant === "search" ? (
          <>
            <span className="listings-empty-ring" />
            <span className="listings-empty-ring listings-empty-ring--delay" />
          </>
        ) : null}
        <span className={`listings-empty-icon listings-empty-icon--${variant}`}>
          <Icon size={28} />
        </span>
      </div>
      <h2 className="listings-empty-title">{homeCopy(titleKey, lang)}</h2>
      {query?.trim() ? (
        <p className="listings-empty-query" aria-label={query}>
          &ldquo;{query.trim()}&rdquo;
        </p>
      ) : null}
      <p className="m listings-empty-body">{homeCopy(bodyKey, lang)}</p>
      {showClear || showBrowse ? (
        <div className="listings-empty-actions">
          {showClear ? (
            <button
              type="button"
              className="btn a listings-empty-cta"
              onClick={onClearFilters}
            >
              {homeCopy("clearFilters", lang)}
            </button>
          ) : null}
          {showBrowse ? (
            <button
              type="button"
              className={`btn listings-empty-cta${showClear ? " listings-empty-cta--ghost" : " a"}`}
              onClick={onBrowseCategories}
            >
              {homeCopy("listingsEmptyBrowse", lang)}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}