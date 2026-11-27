"use client";

import { useEffect, useState } from "react";
import { HomeBottomSheet } from "@/components/app/home/HomeBottomSheet";
import { homeCategoryLabel, homeCopy } from "@/lib/nakuru/home-i18n";
import type { HomeFilters } from "@/lib/nakuru/home-filters";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { ListingMode } from "@/lib/nakuru/types";
import { NAKURU_AREA_KEYS } from "@/lib/nakuru/data/zones";
import { useCategories } from "@/lib/nakuru/use-categories";

const TYPES: { id: ListingMode | ""; labelKey: "filterTypeAll" | "filterTypeShop" | "filterTypeServices" | "filterTypeProperty" | "filterTypeCars" }[] = [
  { id: "", labelKey: "filterTypeAll" },
  { id: "shop", labelKey: "filterTypeShop" },
  { id: "services", labelKey: "filterTypeServices" },
  { id: "property", labelKey: "filterTypeProperty" },
  { id: "cars", labelKey: "filterTypeCars" },
];

type Props = {
  open: boolean;
  lang: LandingLang;
  filters: HomeFilters;
  zone: string;
  onClose: () => void;
  onApply: (patch: Partial<HomeFilters>, zone?: string) => void;
};

export function FilterSheet({
  open,
  lang,
  filters,
  zone,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState(filters);
  const [draftZone, setDraftZone] = useState(zone);
  const { rows: categoryRows } = useCategories();
  const categoryChips = [
    { slug: "all", label: homeCategoryLabel("all", lang) },
    ...categoryRows
      .filter((r) => r.visible && r.depth === 0 && r.kind === "official")
      .map((r) => ({ slug: r.slug, label: r.label })),
  ];

  useEffect(() => {
    if (open) {
      setDraft(filters);
      setDraftZone(zone);
    }
  }, [open, filters, zone]);

  return (
    <HomeBottomSheet
      open={open}
      title={homeCopy("filterSheetTitle", lang)}
      onClose={onClose}
    >
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterCategory", lang)}</legend>
        <div className="home-filter-chips">
          {categoryChips.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              className={`home-filter-chip${draft.cat === chip.slug ? " on" : ""}`}
              aria-pressed={draft.cat === chip.slug}
              onClick={() => setDraft((d) => ({ ...d, cat: chip.slug }))}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterListingType", lang)}</legend>
        <div className="home-filter-chips">
          {TYPES.map((t) => (
            <button
              key={t.id || "all"}
              type="button"
              className={`home-filter-chip${draft.type === t.id ? " on" : ""}`}
              aria-pressed={draft.type === t.id}
              onClick={() => setDraft((d) => ({ ...d, type: t.id }))}
            >
              {homeCopy(t.labelKey, lang)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterPriceRange", lang)}</legend>
        <div className="home-filter-prices">
          <label>
            {homeCopy("filterPriceMin", lang)}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={draft.min ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  min: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </label>
          <label>
            {homeCopy("filterPriceMax", lang)}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="—"
              value={draft.max ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  max: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </label>
        </div>
      </fieldset>
      <fieldset className="home-filter-fieldset">
        <legend>{homeCopy("filterZone", lang)}</legend>
        <select
          value={draftZone}
          onChange={(e) => setDraftZone(e.target.value)}
        >
          {NAKURU_AREA_KEYS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </fieldset>
      <label className="home-filter-check">
        <input
          type="checkbox"
          checked={draft.verified}
          onChange={(e) =>
            setDraft((d) => ({ ...d, verified: e.target.checked }))
          }
        />
        {homeCopy("filterVerifiedOnly", lang)}
      </label>
      <button
        type="button"
        className="btn full"
        onClick={() => {
          onApply(draft, draftZone);
          onClose();
        }}
      >
        {homeCopy("filterApply", lang)}
      </button>
    </HomeBottomSheet>
  );
}
