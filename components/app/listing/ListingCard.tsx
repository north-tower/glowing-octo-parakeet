import { BadgeCheck } from "lucide-react";
import { formatKES } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { ListingCardMedia } from "@/components/app/listing/ListingCardMedia";
import { ListingCardSaveButton } from "@/components/app/listing/ListingCardSaveButton";
import { ListingCardTrackLink } from "@/components/app/listing/ListingCardTrackLink";
import {
  BADGE_CLASS,
  BADGE_LABEL,
  pickListingBadges,
} from "@/components/app/listing/listing-tints";
import type {
  ListingCardChip,
  ListingCardProps,
} from "@/components/app/listing/listing-card-types";

type Props = ListingCardProps & {
  lang: LandingLang;
  variant?: "rail" | "grid";
};

function chipLabel(chip: ListingCardChip, lang: LandingLang): string {
  if (chip === "quote") return homeCopy("chipQuote", lang);
  if (chip === "viewing") return homeCopy("chipViewing", lang);
  if (chip === "free-delivery") return homeCopy("chipFreeDelivery", lang);
  return homeCopy("chipCod", lang);
}

export function ListingCard({
  lang,
  variant = "grid",
  priorityImage,
  ...card
}: Props) {
  const badges = pickListingBadges(card.badges);
  const kes = formatKES(card.price);
  const priceLabel =
    card.priceLabel ??
    `${card.pricePrefix ? `${card.pricePrefix} ` : ""}${kes}${card.priceSuffix ? ` ${card.priceSuffix}` : ""}`;
  const ariaLabel = `${card.title}, ${priceLabel}`;

  return (
    <article className={`lc lc--${variant}`}>
      <ListingCardTrackLink
        href={card.href}
        id={card.id}
        ariaLabel={ariaLabel}
        className="lc-hit"
      >
        <ListingCardMedia
          title={card.title}
          imageUrl={card.imageUrl}
          imageCount={card.imageCount}
          category={card.category}
          priority={priorityImage}
          variant={variant}
        />
        {badges.includes("verified") ? (
          <span className={`lc-badge ${BADGE_CLASS.verified}`}>
            {BADGE_LABEL.verified}
          </span>
        ) : badges[0] ? (
          <span className={`lc-badge ${BADGE_CLASS[badges[0]]}`}>
            {BADGE_LABEL[badges[0]]}
          </span>
        ) : null}
        <div className="lc-body">
          <p className="lc-price">
            {card.pricePrefix ? (
              <span className="lc-price-prefix">{card.pricePrefix}</span>
            ) : null}
            <span className="lc-price-num">{kes}</span>
            {card.priceSuffix ? (
              <span className="lc-price-sfx">{card.priceSuffix}</span>
            ) : null}
          </p>
          <h3 className="lc-title">{card.title}</h3>
          <p className="lc-seller">
            <span className="lc-seller-name">{card.seller}</span>
            {card.sellerVerified ? (
              <BadgeCheck size={14} className="lc-seller-check" aria-hidden />
            ) : null}
            {card.location ? (
              <>
                <span className="lc-seller-dot" aria-hidden>
                  ·
                </span>
                <span className="lc-seller-zone">{card.location}</span>
              </>
            ) : null}
          </p>
          {card.chip ? (
            <span className="lc-chip">{chipLabel(card.chip, lang)}</span>
          ) : (
            <span className="lc-chip lc-chip--ghost" aria-hidden>
              &nbsp;
            </span>
          )}
        </div>
      </ListingCardTrackLink>
      <ListingCardSaveButton listingId={card.id} initialSaved={card.saved} />
    </article>
  );
}
