"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";
import { IconChevronDown } from "@/components/app/icons/LineIcons";

type SortKey = "newest" | "price-asc" | "price-desc";

const PAGE = 12;

type Props = {
  lang: LandingLang;
  items: Listing[];
  onAct: (id: number | string) => void;
  serviceInquiryEnabled?: boolean;
  zoneLabel: string;
};

export function HomePickedForYou({
  lang,
  items,
  onAct,
  serviceInquiryEnabled,
  zoneLabel,
}: Props) {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    let rows = verifiedOnly ? items.filter((i) => i.v === 1) : [...items];
    if (sort === "price-asc") {
      rows = [...rows].sort((a, b) => a.p - b.p);
    } else if (sort === "price-desc") {
      rows = [...rows].sort((a, b) => b.p - a.p);
    }
    return rows;
  }, [items, verifiedOnly, sort]);

  const slice = filtered.slice(0, visible);
  const sortLabelKey: Record<SortKey, HomeCopyKey> = {
    newest: "pickedSortNewest",
    "price-asc": "pickedSortPriceLow",
    "price-desc": "pickedSortPriceHigh",
  };

  return (
    <>
      <HomeSectionHeader titleKey="pickedForYou" lang={lang} />
      <div className="home-picked-filters" role="toolbar" aria-label={homeCopy("pickedFiltersAria", lang)}>
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
            className="home-filter-chip home-filter-chip--sort"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            onClick={() => setSortOpen((o) => !o)}
          >
            {homeCopy(sortLabelKey[sort], lang)}
            <IconChevronDown size={18} />
          </button>
          {sortOpen ? (
            <div className="home-sort-menu" role="listbox">
              {(["newest", "price-asc", "price-desc"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={sort === key}
                  className={sort === key ? "on" : ""}
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
      {slice.length ? (
        <div className="g2 home-picked-grid home-rail--stagger">
          {slice.map((item, i) => (
            <ProductCard
              key={String(item.id)}
              item={item}
              zoneLabel={zoneLabel}
              priorityImage={i < 2}
              onAct={onAct}
              serviceInquiryEnabled={serviceInquiryEnabled}
              navOriginTab="home"
            />
          ))}
        </div>
      ) : (
        <p className="m">{homeCopy("pickedEmpty", lang)}</p>
      )}
      {visible < filtered.length ? (
        <button
          type="button"
          className="btn s home-load-more"
          onClick={() => setVisible((n) => n + PAGE)}
        >
          {homeCopy("pickedLoadMore", lang)}
        </button>
      ) : null}
    </>
  );
}