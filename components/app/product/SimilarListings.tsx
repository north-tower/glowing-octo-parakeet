import { ListingRail } from "@/components/app/home/ListingRail";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { listingCategoryLabel } from "@/lib/nakuru/listing-detail";
import type { Listing } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  title: string;
  items: Listing[];
  onAct: (id: number | string) => void;
  serviceInquiryEnabled: boolean;
  zoneLabel?: string;
};

export function SimilarListings({
  lang,
  title,
  items,
  zoneLabel,
}: Props) {
  if (!items.length) return null;
  return (
    <section className="pd-related" aria-label={title}>
      <div className="home-section-hd">
        <h2 className="home-section-title">{title}</h2>
      </div>
      <ListingRail
        items={items}
        lang={lang}
        zoneLabel={zoneLabel}
        ariaLabel={title}
      />
    </section>
  );
}

export function similarCategoryTitle(item: Listing, lang: LandingLang): string {
  return `${homeCopy("productSimilarIn", lang)} ${listingCategoryLabel(item)}`;
}
