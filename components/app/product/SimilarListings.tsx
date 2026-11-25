import { ProductCard } from "@/components/app/ProductCard";
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
};

export function SimilarListings({
  lang,
  title,
  items,
  onAct,
  serviceInquiryEnabled,
}: Props) {
  if (!items.length) return null;
  return (
    <section className="pd-related" aria-label={title}>
      <div className="home-section-hd">
        <h2 className="home-section-title">{title}</h2>
      </div>
      <div className="pd-related-scroll hs">
        {items.map((item) => (
          <div className="pd-related-card" key={item.id}>
            <ProductCard
              item={item}
              onAct={onAct}
              serviceInquiryEnabled={serviceInquiryEnabled}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function similarCategoryTitle(item: Listing, lang: LandingLang): string {
  return `${homeCopy("productSimilarIn", lang)} ${listingCategoryLabel(item)}`;
}
