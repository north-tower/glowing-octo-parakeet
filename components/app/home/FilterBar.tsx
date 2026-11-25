"use client";

import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { FilterSheet } from "@/components/app/home/FilterSheet";
import { SortSheet } from "@/components/app/home/SortSheet";
import { homeCategoryLabel, homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import {
  countActiveHomeFilters,
  type HomeFilters,
  type HomeSort,
} from "@/lib/nakuru/home-filters";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { NAKURU_AREA_KEYS } from "@/lib/nakuru/data/zones";

const SORT_LABEL: Record<HomeSort, HomeCopyKey> = {
  newest: "pickedSortNewest",
  "price-asc": "pickedSortPriceLow",
  "price-desc": "pickedSortPriceHigh",
  nearest: "sortNearest",
};

type Chip = { id: string; label: string; onRemove: () => void };

type Props = {
  lang: LandingLang;
  filters: HomeFilters;
  resultCount: number;
  zone: string;
  onChange: (patch: Partial<HomeFilters>) => void;
  onZone?: (zone: string) => void;
  onClear: () => void;
};

export function FilterBar({
  lang,
  filters,
  resultCount,
  zone,
  onChange,
  onZone,
  onClear,
}: Props) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const extra = countActiveHomeFilters(filters);

  const chips: Chip[] = [];
  if (filters.cat && filters.cat !== "all") {
    chips.push({
      id: "cat",
      label: homeCategoryLabel(filters.cat, lang),
      onRemove: () => onChange({ cat: "all" }),
    });
  }
  if (filters.verified) {
    chips.push({
      id: "verified",
      label: homeCopy("filterVerifiedOnly", lang),
      onRemove: () => onChange({ verified: false }),
    });
  }
  if (filters.type) {
    const key =
      filters.type === "shop"
        ? "filterTypeShop"
        : filters.type === "services"
          ? "filterTypeServices"
          : filters.type === "property"
            ? "filterTypeProperty"
            : "filterTypeCars";
    chips.push({
      id: "type",
      label: homeCopy(key, lang),
      onRemove: () => onChange({ type: "" }),
    });
  }
  if (filters.min != null || filters.max != null) {
    const min = filters.min != null ? `KES ${filters.min.toLocaleString("en-KE")}` : "0";
    const max = filters.max != null ? `KES ${filters.max.toLocaleString("en-KE")}` : "∞";
    chips.push({
      id: "price",
      label: `${min} – ${max}`,
      onRemove: () => onChange({ min: null, max: null }),
    });
  }
  if (filters.sort !== "newest") {
    chips.push({
      id: "sort",
      label: homeCopy(SORT_LABEL[filters.sort], lang),
      onRemove: () => onChange({ sort: "newest" }),
    });
  }

  return (
    <>
    <div className="filter-bar">
      <div className="filter-bar-row" role="toolbar" aria-label={homeCopy("pickedFiltersAria", lang)}>
        <button
          type="button"
          className="filter-bar-btn"
          onClick={() => setSortOpen(true)}
        >
          <ArrowUpDown size={16} aria-hidden />
          {homeCopy("filterBarSort", lang)}
        </button>
        <button
          type="button"
          className="filter-bar-btn"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal size={16} aria-hidden />
          {homeCopy("filterBarFilter", lang)}
          {extra ? <span className="filter-bar-count">{extra}</span> : null}
        </button>
        <span className="filter-bar-live" aria-live="polite">
          {homeCopy("resultCountLive", lang).replace("{n}", String(resultCount))}
        </span>
      </div>
      {chips.length ? (
        <div className="filter-bar-chips">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="filter-chip-removable"
              onClick={c.onRemove}
            >
              {c.label}
              <X size={14} aria-hidden />
            </button>
          ))}
          <button type="button" className="filter-bar-clear" onClick={onClear}>
            {homeCopy("clearFilters", lang)}
          </button>
        </div>
      ) : null}
      <SortSheet
        open={sortOpen}
        lang={lang}
        value={filters.sort}
        onClose={() => setSortOpen(false)}
        onSelect={(sort) => onChange({ sort })}
      />
      <FilterSheet
        open={filterOpen}
        lang={lang}
        filters={filters}
        zone={zone}
        onClose={() => setFilterOpen(false)}
        onApply={(patch, nextZone) => {
          onChange(patch);
          if (nextZone && nextZone !== zone) onZone?.(nextZone);
        }}
      />
    </div>
    <aside className="filter-bar--panel" aria-label={homeCopy("pickedFiltersAria", lang)}>
      <span className="filter-bar-live" aria-live="polite">
        {homeCopy("resultCountLive", lang).replace("{n}", String(resultCount))}
      </span>
      <label className="home-filter-check">
        {homeCopy("filterBarSort", lang)}
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as HomeSort })}
        >
          <option value="newest">{homeCopy("pickedSortNewest", lang)}</option>
          <option value="price-asc">{homeCopy("pickedSortPriceLow", lang)}</option>
          <option value="price-desc">{homeCopy("pickedSortPriceHigh", lang)}</option>
          <option value="nearest">{homeCopy("sortNearest", lang)}</option>
        </select>
      </label>
      <label className="home-filter-check">
        <input
          type="checkbox"
          checked={filters.verified}
          onChange={(e) => onChange({ verified: e.target.checked })}
        />
        {homeCopy("filterVerifiedOnly", lang)}
      </label>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterPriceRange", lang)}</legend>
        <div className="home-filter-prices">
          <label>
            {homeCopy("filterPriceMin", lang)}
            <input
              type="number"
              min={0}
              value={filters.min ?? ""}
              onChange={(e) =>
                onChange({
                  min: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            {homeCopy("filterPriceMax", lang)}
            <input
              type="number"
              min={0}
              value={filters.max ?? ""}
              onChange={(e) =>
                onChange({
                  max: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
        </div>
      </fieldset>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterZone", lang)}</legend>
        <select
          value={zone}
          onChange={(e) => onZone?.(e.target.value)}
        >
          {NAKURU_AREA_KEYS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterCategory", lang)}</legend>
        <select
          value={filters.cat}
          onChange={(e) => onChange({ cat: e.target.value })}
        >
          {(["all", "shop", "services", "property", "cars"] as const).map((id) => (
            <option key={id} value={id}>
              {homeCategoryLabel(id, lang)}
            </option>
          ))}
        </select>
      </fieldset>
      {chips.length ? (
        <div className="filter-bar-chips">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="filter-chip-removable"
              onClick={c.onRemove}
            >
              {c.label}
              <X size={14} aria-hidden />
            </button>
          ))}
          <button type="button" className="filter-bar-clear" onClick={onClear}>
            {homeCopy("clearFilters", lang)}
          </button>
        </div>
      ) : null}
    </aside>
    </>
  );
}
