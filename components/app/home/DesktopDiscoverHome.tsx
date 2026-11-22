"use client";

import { ProductCard } from "@/components/app/ProductCard";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import { homeCategoryLabel, homeCopy } from "@/lib/nakuru/home-i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { CategoryId, Listing } from "@/lib/nakuru/types";

type Props = {
  lang: LandingLang;
  items: Listing[];
  loading: boolean;
  error: string | null;
  liveCatalog: boolean;
  cat: string;
  query: string;
  zoneLabel: string;
  serviceInquiryEnabled: boolean;
  onAct: (id: number | string) => void;
  onClear: () => void;
  onCat: (cat: string) => void;
};

export function DesktopDiscoverHome({
  lang,
  items,
  loading,
  error,
  liveCatalog,
  cat,
  query,
  zoneLabel,
  serviceInquiryEnabled,
  onAct,
  onClear,
  onCat,
}: Props) {
  const { rows } = useCategories();
  const filtered = Boolean(query.trim() || (cat && cat !== "all"));
  const sorted = [...items].sort((a, b) => (b.v ?? 0) - (a.v ?? 0));
  const official = rows.filter((r) => r.kind === "official");

  return (
    <div className="discover">
      <div className="discover-head">
        <div>
          <p className="discover-kicker">{homeCopy("discoverEyebrow", lang)}</p>
          <h2 className="discover-title">{homeCopy("discoverTitle", lang)}</h2>
          <p className="discover-sub">{homeCopy("discoverSub", lang)}</p>
        </div>
        <div className="discover-head-actions">
          {filtered ? (
            <button type="button" className="discover-clear" onClick={onClear}>
              {homeCopy("clearFilters", lang)}
            </button>
          ) : null}
          <label className="discover-sort">
            <span className="sr-only">{homeCopy("featuredFirst", lang)}</span>
            <select defaultValue="featured" aria-label={homeCopy("featuredFirst", lang)}>
              <option value="featured">{homeCopy("featuredFirst", lang)}</option>
            </select>
          </label>
        </div>
      </div>
      <div className="discover-pills" role="tablist" aria-label={homeCopy("browseByType", lang)}>
        <button
          type="button"
          className={`discover-pill${cat === "all" ? " on" : ""}`}
          onClick={() => onCat("all")}
        >
          {homeCategoryLabel("all", lang)}
        </button>
        {official.map((row) => (
          <button
            type="button"
            key={row.slug}
            className={`discover-pill${cat === row.slug ? " on" : ""}`}
            onClick={() => onCat(row.slug)}
          >
            {row.kind === "official"
              ? homeCategoryLabel(row.slug as CategoryId, lang)
              : row.label}
          </button>
        ))}
      </div>
      {error ? <div className="err">{error}</div> : null}
      {loading ? (
        <ListingsSkeleton count={8} />
      ) : sorted.length ? (
        <div className="discover-grid">
          {sorted.map((item, idx) => (
            <ProductCard
              key={String(item.id)}
              item={item}
              zoneLabel={zoneLabel}
              priorityImage={idx < 4}
              navOriginTab="home"
              layout="classified"
              serviceInquiryEnabled={serviceInquiryEnabled}
              onAct={onAct}
            />
          ))}
        </div>
      ) : liveCatalog ? (
        <ListingsEmpty />
      ) : (
        <div className="m">
          {lang === "sw"
            ? "Hakuna matokeo. Jaribu utafutaji mwingine."
            : "No results. Try a different search."}
        </div>
      )}
    </div>
  );
}
