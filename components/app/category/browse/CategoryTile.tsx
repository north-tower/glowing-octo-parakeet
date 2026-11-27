"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";
import { BrowseStyleTileLink } from "@/components/app/category/browse/BrowseStyleTile";

type Props = {
  slug: string;
  label: string;
  icon: LucideIcon;
  tint: CategoryTint;
  image?: string | null;
  count?: string;
};

export function CategoryTile({ slug, label, icon, tint, image, count }: Props) {
  const pathname = usePathname();
  const href = `/category/${slug}`;
  const selected = pathname === href || pathname === `${href}/`;

  return (
    <BrowseStyleTileLink
      href={href}
      label={label}
      icon={icon}
      tint={tint}
      image={image}
      count={count}
      selected={selected}
    />
  );
}