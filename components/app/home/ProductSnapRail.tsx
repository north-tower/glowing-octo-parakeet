"use client";

import { ListingCard } from "@/components/app/listing/ListingCard";
import { ListingRow, ListingRowItem } from "@/components/app/listing/ListingRow";
import { listingToCardProps } from "@/lib/nakuru/listing-card-props";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";

type Props = {
  items: Listing[];
  lang: LandingLang;
  zoneLabel?: string;
  loading?: boolean;
};

export function ProductSnapRail({
  items,
  lang,
  zoneLabel,
  loading,
}: Props) {
  if (!items.length && !loading) return null;

  return (
    <ListingRow loading={loading}>
      {items.map((item, i) => (
        <ListingRowItem key={String(item.id)}>
          <ListingCard
            {...listingToCardProps(item, lang, zoneLabel)}
            lang={lang}
            variant="rail"
            priorityImage={i < 2}
          />
        </ListingRowItem>
      ))}
    </ListingRow>
  );
}