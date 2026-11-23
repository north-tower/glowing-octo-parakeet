"use client";

import { ProductCard } from "@/components/app/ProductCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import { CategoryRow } from "@/components/app/category/CategoryRow";
import { CategoryTile } from "@/components/app/CategoryTile";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { SlideArtDelivery } from "@/components/app/HomeSlideArt";
import { CAT_POPULAR, TOPC } from "@/lib/nakuru/data/constants";
import { BrowseByTypeSection } from "@/components/app/category/browse/BrowseByTypeSection";
import { BrowseStyleTileButton } from "@/components/app/category/browse/BrowseStyleTile";
import {
  popularLucideForCommunity,
  popularLucideForTopcIndex,
} from "@/components/app/category/browse/popular-lucide";
import { iconForCategorySlug } from "@/lib/nakuru/category-root-visual";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import {
  homeCategoryAllLabel,
  homeCategoryGroupDesc,
  homeCategoryLabel,
  homeCopy,
  homeTopCategoryLabel,
} from "@/lib/nakuru/home-i18n";
import {
  ListingsEmpty,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";
import type { CategoryId, Listing } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import { IconChevronLeft, IconSparkle } from "@/components/app/icons/LineIcons";
import { useEffect, useMemo, useState } from "react";

type ListingsState = {
  items: Listing[];
  loading: boolean;
  error: string | null;
};

type Props = {
  lang: LandingLang;
  liveCatalog: boolean;
  listings: ListingsState;
  serviceInquiryEnabled: boolean;
  onAct: Parameters<typeof ProductCard>[0]["onAct"];
};

function topIndicesForSide(side: string): number[] {
  const ks: number[] = [];
  TOPC.forEach((t, k) => {
    if (t[2] === side) ks.push(k);
  });
  return ks;
}

function PromoBanner({ lang, onShop }: { lang: LandingLang; onShop: () => void }) {
  return (
    <div
      className="sl sl--teal cat-promo-slide"
      role="button"
      tabIndex={0}
      onClick={onShop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onShop();
        }
      }}
    >
      <div className="sl-grain" aria-hidden />
      <div className="sl-text">
        <b>{homeCopy("slide0Title", lang)}</b>
        <span>{homeCopy("slide0Sub", lang)}</span>
      </div>
      <SlideArtDelivery />
    </div>
  );
}

function EmptySubcats({ lang }: { lang: LandingLang }) {
  return (
    <div className="cat-empty" role="status">
      <span className="cat-empty-icon" aria-hidden>
        <IconSparkle size={32} />
      </span>
      <p>{homeCopy("moreComingSoon", lang)}</p>
    </div>
  );
}

export function CategoryPanel({
  lang,
  liveCatalog,
  listings,
  serviceInquiryEnabled,
  onAct,
}: Props) {
  const { state, dispatch } = useNakuruApp();
  const { rows: categoryRows } = useCategories();
  const communityFeatured = categoryRows.filter((r) => r.kind === "community");
  const s = state.side;
  const roots = useMemo(
  () => categoryRows.filter((r) => r.depth === 0),
    [categoryRows],
  );
  const isBrowseGroup =
    s !== "feat" && roots.some((r) => r.slug === s);
  const [focusSlug, setFocusSlug] = useState(s);

  useEffect(() => {
    setFocusSlug(s);
  }, [s]);

  const focusRow = categoryRows.find((r) => r.slug === focusSlug);
  const childRows = categoryRows.filter((r) => r.parentSlug === focusSlug);
  const showListings = liveCatalog && (isBrowseGroup || state.cat !== "all");
  const ks = topIndicesForSide(s);
  const sparse = ks.length > 0 && ks.length <= 2;
  const gridClass = `home-cat-grid${sparse ? " home-cat-grid--sparse" : ""}${s === "feat" ? "" : ""}`;
  return (
    <div className="cat-panel rp cat-panel--hub">
      {s === "feat" ? (
        <>
          <PromoBanner
            lang={lang}
            onShop={() => dispatch({ type: "SLIDE_SHOP" })}
          />
          <HomeSectionHeader titleKey="popularRightNow" lang={lang} />
          <div className="cat-popular-track" role="list">
            {CAT_POPULAR.map((k) => {
              const t = TOPC[k]!;
              const visual = popularLucideForTopcIndex(k);
              const label = t[3]
                ? homeTopCategoryLabel(t[3], lang)
                : t[1];
              return (
                <div key={k} className="cat-popular-item" role="listitem">
                  <BrowseStyleTileButton
                    icon={visual.icon}
                    tint={visual.tint}
                    label={label}
                    onActivate={() =>
                      dispatch({ type: "SELECT_TOPC", index: k })
                    }
                  />
                </div>
              );
            })}
          </div>
          {communityFeatured.length ? (
            <div className="cat-popular-track" style={{ marginTop: 8 }}>
              {communityFeatured.map((row) => {
                const visual = popularLucideForCommunity();
                return (
                  <div key={row.slug} className="cat-popular-item">
                    <BrowseStyleTileButton
                      icon={visual.icon}
                      tint={visual.tint}
                      label={row.label}
                      onActivate={() =>
                        dispatch({ type: "SET_CAT", cat: row.slug })
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
          <BrowseByTypeSection lang={lang} />
        </>
      ) : isBrowseGroup ? (
        <>
          <button
            type="button"
            className="cat-hub-back"
            onClick={() => {
              setFocusSlug("feat");
              dispatch({ type: "SET_CAT", cat: "all" });
              dispatch({ type: "SET_SIDE", side: "feat" });
            }}
          >
            <IconChevronLeft size={20} aria-hidden />
            {homeCopy("categoryAllSections", lang)}
          </button>
          <PromoBanner
            lang={lang}
            onShop={() => dispatch({ type: "SLIDE_SHOP" })}
          />
          <div className="cat-panel-group-hd">
            <h2 className="cat-panel-group-title">
              {focusRow?.label ??
                homeCategoryLabel(s as CategoryId, lang)}
            </h2>
            <p className="cat-panel-group-desc m">
              {homeCategoryGroupDesc(s as CategoryId, lang) ||
                homeCopy("categoryDrillHint", lang)}
            </p>
          </div>
          {childRows.length > 0 ? (
            <div className="cat-row-list">
              {childRows.map((row: DirectoryCategory) => (
                <CategoryRow
                  key={row.slug}
                  icon={iconForCategorySlug(row.slug, row.listingMode)}
                  label={row.label}
                  onActivate={() => {
                    if (row.hasChildren) {
                      setFocusSlug(row.slug);
                    } else {
                      dispatch({ type: "SET_CAT", cat: row.slug });
                    }
                  }}
                />
              ))}
              <CategoryRow
                icon="grid"
                label={homeCategoryAllLabel(s as CategoryId, lang)}
                onActivate={() => dispatch({ type: "SET_CAT", cat: focusSlug })}
              />
            </div>
          ) : ks.length === 0 ? (
            <EmptySubcats lang={lang} />
          ) : (
            <div className={gridClass}>
              {ks.map((k) => {
                const t = TOPC[k]!;
                return (
                  <CategoryTile
                    key={k}
                    icon={t[0]}
                    tint={t[4]}
                    label={
                      t[3]
                        ? homeTopCategoryLabel(t[3], lang)
                        : t[1]
                    }
                    onActivate={() =>
                      dispatch({ type: "SELECT_TOPC", index: k })
                    }
                  />
                );
              })}
              {sparse ? (
                <CategoryTile
                  icon="grid"
                  tint={TOPC[ks[0]!]![4]}
                  label={homeCategoryAllLabel(s as CategoryId, lang)}
                  onActivate={() =>
                    dispatch({
                      type: "SET_CAT",
                      cat: s as CategoryId,
                    })
                  }
                />
              ) : null}
            </div>
          )}
        </>
      ) : null}

      {showListings ? (
        <div className="cat-listings-block">
          <HomeSectionHeader
            titleKey="listings"
            lang={lang}
            seeAll={{
              onClick: () =>
                dispatch({
                  type: "SET_CAT",
                  cat: state.cat !== "all" ? state.cat : focusSlug,
                }),
            }}
          />
          {listings.error ? (
            <div className="err" style={{ marginTop: 8 }}>
              {listings.error}
            </div>
          ) : null}
          {listings.loading ? (
            <ListingsSkeleton count={4} />
          ) : listings.items.length ? (
            <div className="g2" style={{ marginTop: 8 }}>
              {listings.items.map((i) => (
                <ProductCard
                  key={String(i.id)}
                  item={i}
                  navOriginTab="cat"
                  serviceInquiryEnabled={serviceInquiryEnabled}
                  onAct={onAct}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <ListingsEmpty />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}