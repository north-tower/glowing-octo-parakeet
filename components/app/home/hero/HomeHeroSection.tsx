"use client";

import { BadgeCheck, Store } from "lucide-react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { HeroCarousel } from "./HeroCarousel";
import { HeroSideCard } from "./HeroSideCard";
import type { HeroSlideAction } from "./heroSlides";

type HomeHeroSectionProps = {
  lang: LandingLang;
  carouselEnabled: boolean;
  onSlideAction: (action: HeroSlideAction) => void;
  onPostListing: () => void;
  onPayExplain: () => void;
};

export function HomeHeroSection({
  lang,
  carouselEnabled,
  onSlideAction,
  onPostListing,
  onPayExplain,
}: HomeHeroSectionProps) {
  return (
    <div className="home-hero-section">
      <HeroCarousel
        lang={lang}
        enabled={carouselEnabled}
        onSlideAction={onSlideAction}
      />
      <div className="home-hero-side">
        <HeroSideCard
          icon={Store}
          title={homeCopy("heroSidePostTitle", lang)}
          description={homeCopy("heroSidePostCopy", lang)}
          linkLabel={homeCopy("heroSidePostLink", lang)}
          onLinkClick={onPostListing}
        />
        <HeroSideCard
          icon={BadgeCheck}
          tone="fl"
          title={homeCopy("heroSidePayTitle", lang)}
          description={homeCopy("heroSidePayCopy", lang)}
          linkLabel={homeCopy("heroSidePayLink", lang)}
          onLinkClick={onPayExplain}
        />
      </div>
    </div>
  );
}
