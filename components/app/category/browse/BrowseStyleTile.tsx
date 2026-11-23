"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CATEGORY_TINT_CLASSES,
  type CategoryTint,
} from "@/components/app/category/browse/categories";

type VisualProps = {
  label: string;
  icon: LucideIcon;
  tint: CategoryTint;
  count?: string;
  selected?: boolean;
};

function TileBody({
  label,
  icon: Icon,
  tint,
  count,
}: Omit<VisualProps, "selected">) {
  const tintMod = CATEGORY_TINT_CLASSES[tint];
  return (
    <>
      <span
        className={`browse-tile__icon browse-tile__icon--${tintMod}`}
        aria-hidden
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="browse-tile__label">{label}</span>
      {count ? <span className="browse-tile__count">{count}</span> : null}
    </>
  );
}

type LinkProps = VisualProps & {
  href: string;
  ariaLabel?: string;
};

type ButtonProps = VisualProps & {
  onActivate: () => void;
  ariaLabel?: string;
};

export function BrowseStyleTileLink({
  href,
  label,
  icon,
  tint,
  count,
  selected = false,
  ariaLabel,
}: LinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? label}
      aria-current={selected ? "page" : undefined}
      className={selected ? "browse-tile browse-tile--selected" : "browse-tile"}
    >
      <TileBody label={label} icon={icon} tint={tint} count={count} />
    </Link>
  );
}

export function BrowseStyleTileButton({
  label,
  icon,
  tint,
  count,
  onActivate,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type="button"
      className="browse-tile"
      aria-label={ariaLabel ?? label}
      onClick={onActivate}
    >
      <TileBody label={label} icon={icon} tint={tint} count={count} />
    </button>
  );
}