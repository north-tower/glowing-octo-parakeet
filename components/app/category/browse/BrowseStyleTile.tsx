"use client";

import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  CATEGORY_TINT_CLASSES,
  type CategoryTint,
} from "@/components/app/category/browse/categories";

type VisualProps = {
  label: string;
  icon: LucideIcon;
  tint: CategoryTint;
  image?: string | null;
  count?: string;
  selected?: boolean;
};

function TileBody({
  label,
  icon: Icon,
  tint,
  image,
  count,
}: Omit<VisualProps, "selected">) {
  const tintMod = CATEGORY_TINT_CLASSES[tint];
  return (
    <>
      <span
        className={`browse-tile__icon browse-tile__icon--${tintMod}${image ? " browse-tile__icon--photo" : ""}`}
        aria-hidden
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={56}
            height={56}
            sizes="56px"
            className="browse-tile__photo"
            draggable={false}
          />
        ) : (
          <Icon size={22} strokeWidth={1.75} />
        )}
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
  image,
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
      <TileBody
        label={label}
        icon={icon}
        tint={tint}
        image={image}
        count={count}
      />
    </Link>
  );
}

export function BrowseStyleTileButton({
  label,
  icon,
  tint,
  image,
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
      <TileBody
        label={label}
        icon={icon}
        tint={tint}
        image={image}
        count={count}
      />
    </button>
  );
}
