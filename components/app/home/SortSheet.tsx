"use client";

import { IconCheck } from "@/components/app/icons/LineIcons";
import { HomeBottomSheet } from "@/components/app/home/HomeBottomSheet";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { HomeSort } from "@/lib/nakuru/home-filters";
import type { LandingLang } from "@/lib/nakuru/i18n";

const OPTIONS: { id: HomeSort; labelKey: HomeCopyKey }[] = [
  { id: "newest", labelKey: "pickedSortNewest" },
  { id: "price-asc", labelKey: "pickedSortPriceLow" },
  { id: "price-desc", labelKey: "pickedSortPriceHigh" },
  { id: "nearest", labelKey: "sortNearest" },
];

type Props = {
  open: boolean;
  lang: LandingLang;
  value: HomeSort;
  onClose: () => void;
  onSelect: (sort: HomeSort) => void;
};

export function SortSheet({ open, lang, value, onClose, onSelect }: Props) {
  return (
    <HomeBottomSheet
      open={open}
      title={homeCopy("sortSheetTitle", lang)}
      onClose={onClose}
    >
      <ul className="zone-sheet-list">
        {OPTIONS.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              className={`zone-sheet-row${value === opt.id ? " is-selected" : ""}`}
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
            >
              <span className="zone-sheet-label">
                {homeCopy(opt.labelKey, lang)}
              </span>
              {value === opt.id ? (
                <span className="zone-sheet-check">
                  <IconCheck size={18} />
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </HomeBottomSheet>
  );
}
