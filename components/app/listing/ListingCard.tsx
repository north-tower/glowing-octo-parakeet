import {
  BadgeCheck,
  Eye,
  MessageSquareQuote,
  Wallet,
} from "lucide-react";
import { formatPriceParts } from "@/lib/nakuru/format-price";
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
import type { ReactNode } from "react";
import type { ListingCardProps } from "@/components/app/listing/listing-card-types";

type Props = ListingCardProps & {
  lang: LandingLang;
  variant?: "rail" | "grid";
};

function actionCopy(
  action: ListingCardProps["action"],
  lang: LandingLang,
): string | null {
  if (action === "viewing") return homeCopy("productRequestViewing", lang);
  if (action === "quote") return homeCopy("productRequestQuote", lang);
  return null;
}

export function ListingCard({
  lang,
  variant = "grid",
  priorityImage,
  ...card
}: Props) {
  const { currency, amount } = formatPriceParts(card.price, card.currency);
  const badges = pickListingBadges(card.badges);
  const actionLabel = actionCopy(card.action, lang);
  const chips: {
    key: string;
    tone: "emerald" | "stone";
    label: string;
    icon: ReactNode;
  }[] = [];
  if (card.payOnDelivery) {
    chips.push({
      key: "cod",
      tone: "emerald",
      label: homeCopy("payOnDelivery", lang),
      icon: <Wallet size={12} aria-hidden />,
    });
  }
  if (actionLabel) {
    chips.push({
      key: "act",
      tone: "stone",
      label: actionLabel,
      icon:
        card.action === "quote" ? (
          <MessageSquareQuote size={12} aria-hidden />
        ) : (
          <Eye size={12} aria-hidden />
        ),
    });
  }
  const visibleChips = chips.slice(0, 2);
  const ariaLabel = `${card.title}, ${currency} ${amount}`;

  return (
    <article className="flex h-full min-h-0 flex-col">
      <ListingCardTrackLink
        href={card.href}
        id={card.id}
        ariaLabel={ariaLabel}
        className="group flex h-full min-h-0 flex-col rounded-2xl border border-stone-200/90 bg-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="relative">
          <ListingCardMedia
            title={card.title}
            imageUrl={card.imageUrl}
            imageCount={card.imageCount}
            category={card.category}
            priority={priorityImage}
            variant={variant}
          />
          {badges.length ? (
            <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
              {badges.map((b) => (
                <span
                  key={b}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_CLASS[b]}`}
                >
                  {BADGE_LABEL[b]}
                </span>
              ))}
            </div>
          ) : null}
          <ListingCardSaveButton initialSaved={card.saved} />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-base font-bold tabular-nums text-stone-900">
            <span className="mr-1 text-xs font-medium text-stone-500">
              {currency}
            </span>
            {amount}
            {card.priceSuffix ? (
              <span className="ml-1 text-xs font-medium text-stone-500">
                {card.priceSuffix}
              </span>
            ) : null}
          </p>
          <h3 className="min-h-[2.5rem] text-sm font-medium leading-snug text-stone-800 line-clamp-2">
            {card.title}
          </h3>
          <p className="truncate text-xs text-stone-500">
            <span>{card.seller}</span>
            {card.sellerVerified ? (
              <BadgeCheck
                size={14}
                className="ml-1 inline align-[-2px] text-emerald-600"
                aria-hidden
              />
            ) : null}
            {card.location ? (
              <>
                <span aria-hidden> · </span>
                <span>{card.location}</span>
              </>
            ) : null}
          </p>
          <div className="mt-auto flex min-h-7 flex-nowrap items-center gap-1.5 pt-1">
            {visibleChips.map((chip) =>
              chip.tone === "emerald" ? (
                <span
                  key={chip.key}
                  className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ) : (
                <span
                  key={chip.key}
                  className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-stone-200 bg-white px-2 py-0.5 text-xs font-medium text-stone-700"
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ),
            )}
          </div>
        </div>
      </ListingCardTrackLink>
    </article>
  );
}