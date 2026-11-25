"use client";

import { ShieldCheck, Wallet } from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useHomePromotions } from "@/lib/nakuru/use-home-promotions";
import { HeroCarousel } from "./HeroCarousel";
import { HeroSideCard } from "./HeroSideCard";
import type { HeroSlideAction } from "./heroSlides";

type HomeHeroSectionProps = {
  lang: LandingLang;
  carouselEnabled: boolean;
  onSlideAction: (action: HeroSlideAction) => void;
  onVendorListing: (productId: string) => void;
  onTrustLink: () => void;
  onPayLink: () => void;
};

function SideCardsColumn({
  lang,
  onTrustLink,
  onPayLink,
  className,
}: Pick<
  HomeHeroSectionProps,
  "lang" | "onTrustLink" | "onPayLink"
> & { className?: string }) {
  return (
    <div className={className}>
      <HeroSideCard
        icon={ShieldCheck}
        iconTintClass="bg-emerald-50 text-[#0d6f69]"
        title={homeCopy("trustVerifiedTitle", lang)}
        description={homeCopy("trustVerifiedSub", lang)}
        linkLabel={homeCopy("trustVerifiedLink", lang)}
        onLinkClick={onTrustLink}
      />
      <HeroSideCard
        icon={Wallet}
        iconTintClass="bg-amber-50 text-amber-800"
        title={homeCopy("trustPayTitle", lang)}
        description={homeCopy("trustPaySub", lang)}
        linkLabel={homeCopy("trustPayLink", lang)}
        onLinkClick={onPayLink}
      />
    </div>
  );
}

export function HomeHeroSection({
  lang,
  carouselEnabled,
  onSlideAction,
  onVendorListing,
  onTrustLink,
  onPayLink,
}: HomeHeroSectionProps) {
  const { promotions } = useHomePromotions(carouselEnabled);

  return (
    <div className="home-hero-section flex w-full min-w-0 flex-col gap-3">
      <div className="grid min-h-[220px] gap-4 lg:min-h-[280px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="min-h-[inherit] min-w-0">
          <HeroCarousel
            lang={lang}
            enabled={carouselEnabled}
            vendorPromotions={promotions}
            onSlideAction={onSlideAction}
            onVendorListing={onVendorListing}
          />
        </div>
        <SideCardsColumn
          lang={lang}
          onTrustLink={onTrustLink}
          onPayLink={onPayLink}
          className="hidden h-full min-h-0 grid-rows-2 gap-3 lg:grid"
        />
      </div>
      <SideCardsColumn
        lang={lang}
        onTrustLink={onTrustLink}
        onPayLink={onPayLink}
        className="grid grid-cols-2 gap-2 sm:gap-3 lg:hidden"
      />
    </div>
  );
}