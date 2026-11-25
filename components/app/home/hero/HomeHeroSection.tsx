"use client";

import type { LandingLang } from "@/lib/nakuru/i18n";
import { HeroCarousel } from "./HeroCarousel";
import type { HeroSlideAction } from "./heroSlides";

type HomeHeroSectionProps = {
  lang: LandingLang;
  carouselEnabled: boolean;
  onSlideAction: (action: HeroSlideAction) => void;
};

export function HomeHeroSection({
  lang,
  carouselEnabled,
  onSlideAction,
}: HomeHeroSectionProps) {
  return (
    <div className="home-hero-section">
      <HeroCarousel
        lang={lang}
        enabled={carouselEnabled}
        onSlideAction={onSlideAction}
      />
    </div>
  );
}
