import Link from "next/link";
import { IconCheck, IconChevronRight } from "@/components/app/icons/LineIcons";
import { appCategoryHref } from "@/lib/nakuru/app-nav-href";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import {
  formatPropertyPrice,
  propertyLocation,
  propertyTenure,
} from "@/lib/nakuru/property-display";
import { listingCategoryLabel, listingDisplayPrice } from "@/lib/nakuru/listing-detail";
import type { ProductDetail } from "@/lib/nakuru/listing-detail";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { IconMapPin } from "@/components/app/icons/LineIcons";

type Props = {
  detail: ProductDetail;
  tint: string;
  lang: LandingLang;
  onOpenSeller: () => void;
};

export function ListingHeader({ detail, tint, lang, onOpenSeller }: Props) {
  const mode = listingModeOf(detail);
  const categoryName = listingCategoryLabel(detail);
  const categoryHref = appCategoryHref({ cat: detail.c });
  const propLoc = mode === "property" ? propertyLocation(detail) : null;
  const propertyPrice =
    mode === "property"
      ? formatPropertyPrice(detail.p, propertyTenure(detail), lang)
      : null;

  return (
    <div className="pd-head">
      <nav className="pd-crumb" aria-label="Category">
        <Link href={categoryHref} className={`pd-chip pd-chip--${tint}`}>
          {categoryName}
        </Link>
      </nav>
      <h1 className="pd-title">{detail.t}</h1>
      {propLoc ? (
        <p className="pd-property-loc">
          <IconMapPin size={18} aria-hidden />
          {propLoc}
        </p>
      ) : null}
      <p className="pd-price">
        {propertyPrice ? (
          <>
            <span>{propertyPrice.amount}</span>
            {propertyPrice.suffix ? (
              <span className="pd-price-suffix"> {propertyPrice.suffix}</span>
            ) : null}
          </>
        ) : (
          listingDisplayPrice(detail)
        )}
      </p>
      <p className="pd-rating m">{homeCopy("productNoReviews", lang)}</p>
      <button type="button" className="pd-vendor-link" onClick={onOpenSeller}>
        <span className="pd-vendor-link-label">{detail.vendorName}</span>
        {detail.v === 1 ? (
          <span
            className="pd-vendor-tick"
            aria-label={homeCopy("verifiedPill", lang)}
          >
            <IconCheck size={16} />
          </span>
        ) : null}
        <IconChevronRight size={20} aria-hidden />
      </button>
    </div>
  );
}
