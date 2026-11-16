"use client";

import {
  CategoryIcon,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import type { TopCategoryTint } from "@/lib/nakuru/data/constants";

type Props = {
  icon: CategoryIconKey;
  tint: TopCategoryTint;
  label: string;
  onActivate: () => void;
};

export function CategoryTile({ icon, tint, label, onActivate }: Props) {
  return (
    <div
      className={`ct ct--${tint}`}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <span className="ct-icon" aria-hidden>
        <CategoryIcon icon={icon} size={24} />
      </span>
      <span className="ct-label">{label}</span>
    </div>
  );
}