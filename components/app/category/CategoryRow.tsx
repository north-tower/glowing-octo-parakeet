"use client";

import {
  CategoryIcon,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import { IconChevronRight } from "@/components/app/icons/LineIcons";

type Props = {
  icon: CategoryIconKey;
  label: string;
  hint?: string;
  onActivate: () => void;
};

export function CategoryRow({ icon, label, hint, onActivate }: Props) {
  return (
    <button type="button" className="cat-row" onClick={onActivate}>
      <span className="cat-row-icon" aria-hidden>
        <CategoryIcon icon={icon} size={22} />
      </span>
      <span className="cat-row-copy">
        <span className="cat-row-label">{label}</span>
        {hint ? <span className="cat-row-hint">{hint}</span> : null}
      </span>
      <span className="cat-row-chev" aria-hidden>
        <IconChevronRight size={20} />
      </span>
    </button>
  );
}