"use client";

import { ShieldCheck, Wallet } from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { HeroCarousel } from "./HeroCarousel";
import { HeroSideCard } from "./HeroSideCard";
import type { HeroSlideAction } from "./heroSlides";
import {
  IconBookOpen,
  IconMessageQuote,
} from "@/components/app/icons/LineIcons";

type HomeHeroSectionProps = {
  lang: LandingLang;
  carouselEnabled: boolean;
  guideOpen: boolean;
  onSlideAction: (action: HeroSlideAction) => void;
  onQuote: () => void;
  onToggleGuide: () => void;
  onTrustLink: () => void;
  onPayLink: () => void;
};

function QuickChips({
  lang,
  guideOpen,
  onQuote,
  onToggleGuide,
}: Pick<
  HomeHeroSectionProps,
  "lang" | "guideOpen" | "onQuote" | "onToggleGuide"
>) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <button
        type="button"
        onClick={onQuote}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6f69] focus-visible:ring-offset-2"
      >
        <span className="text-[#0d6f69]">
          <IconMessageQuote size={18} />
        </span>
        {homeCopy("qaQuote", lang)}
      </button>
      <button
        type="button"
        aria-expanded={guideOpen}
        onClick={onToggleGuide}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6f69] focus-visible:ring-offset-2 ${
          guideOpen
            ? "border-[#0d6f69]/35 bg-[#0d6f69]/10 text-stone-900"
            : "border-stone-200 bg-white text-stone-900 hover:border-stone-300"
        }`}
      >
        <span className="text-[#0d6f69]">
          <IconBookOpen size={18} />
        </span>
        {homeCopy("qaGuide", lang)}
      </button>
    </div>
  );
}

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
  guideOpen,
  onSlideAction,
  onQuote,
  onToggleGuide,
  onTrustLink,
  onPayLink,
}: HomeHeroSectionProps) {
  return (
    <div className="home-hero-section flex w-full min-w-0 flex-col gap-3">
      <div className="grid min-h-[220px] gap-4 lg:min-h-[280px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="min-h-[inherit] min-w-0">
          <HeroCarousel
            lang={lang}
            enabled={carouselEnabled}
            onSlideAction={onSlideAction}
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
      <QuickChips
        lang={lang}
        guideOpen={guideOpen}
        onQuote={onQuote}
        onToggleGuide={onToggleGuide}
      />
    </div>
  );
}