"use client";

import { ListingCard } from "@/components/app/listing/ListingCard";
import { ListingRow, ListingRowItem } from "@/components/app/listing/ListingRow";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { listingToCardProps } from "@/lib/nakuru/listing-card-props";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { Listing } from "@/lib/nakuru/types";

type Props = {
  items: Listing[];
  lang: LandingLang;
  zoneLabel?: string;
  loading?: boolean;
  ariaLabel?: string;
};

export function ListingRail({
  items,
  lang,
  zoneLabel,
  loading,
  ariaLabel,
}: Props) {
  if (!items.length && !loading) {
    return (
      <p className="home-rail-empty" role="status">
        {homeCopy("railEmpty", lang)}
      </p>
    );
  }

  return (
    <ListingRow loading={loading} ariaLabel={ariaLabel}>
      {items.map((item, i) => (
        <ListingRowItem key={String(item.id)}>
          <ListingCard
            {...listingToCardProps(item, lang, zoneLabel)}
            lang={lang}
            variant="rail"
            priorityImage={i < 1}
          />
        </ListingRowItem>
      ))}
    </ListingRow>
  );
}

/** @deprecated Use ListingRail */
export function ProductSnapRail(props: Props) {
  return <ListingRail {...props} />;
}
