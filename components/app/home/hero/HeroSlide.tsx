"use client";

import { ArrowRight } from "lucide-react";
import type { HeroSlideData, HeroSlideTone } from "./heroSlides";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";

type HeroSlideProps = {
  slide: HeroSlideData;
  slideIndex: number;
  total: number;
  active: boolean;
  lang: LandingLang;
  tone: HeroSlideTone;
  progress: number;
  showProgress: boolean;
  onCta: () => void;
};

function textColor(tone: HeroSlideTone) {
  return tone === "dark"
    ? "text-white"
    : "text-stone-900";
}

function subtitleColor(tone: HeroSlideTone) {
  return tone === "dark"
    ? "text-white/90"
    : "text-stone-700";
}

function ctaClasses(tone: HeroSlideTone) {
  return tone === "dark"
    ? "!bg-white !text-stone-900 hover:!bg-stone-100"
    : "!bg-stone-900 !text-white hover:!bg-stone-800";
}

export function HeroSlide({
  slide,
  slideIndex,
  total,
  active,
  lang,
  tone,
  progress,
  showProgress,
  onCta,
}: HeroSlideProps) {
  const Icon = slide.icon;
  const title = homeCopy(slide.titleKey, lang);
  const subtitle = homeCopy(slide.subtitleKey, lang);
  const ctaLabel = homeCopy(slide.cta.labelKey, lang);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${total}`}
      aria-hidden={!active}
      className={`relative flex min-h-[220px] w-full shrink-0 snap-start snap-always flex-col justify-center overflow-hidden rounded-3xl sm:min-h-[280px] ${slide.gradient} ${textColor(tone)}`}
    >
      <div className="relative flex min-h-[inherit] w-full items-center p-6 sm:p-10">
        <div className="z-[1] flex min-w-0 max-w-full flex-1 flex-col gap-3 sm:max-w-[55%] sm:gap-4">
          <div>
            <h2 className="m-0 !text-2xl font-semibold leading-tight tracking-tight sm:!text-4xl lg:!text-5xl">
              {title}
            </h2>
            <p
              className={`mt-3 text-base sm:text-lg ${
                tone === "dark" ? "text-white/90" : subtitleColor(tone)
              }`}
            >
              {subtitle}
            </p>
          </div>
          <div>
            <button
              type="button"
              tabIndex={active ? 0 : -1}
              onClick={onCta}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${ctaClasses(tone)}`}
            >
              {ctaLabel}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
        <div
          className="absolute right-6 top-1/2 z-[1] hidden -translate-y-1/2 sm:right-10 sm:block"
          aria-hidden
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-md sm:size-20">
            <Icon
              className={`size-8 sm:size-9 ${slide.iconColorClass}`}
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>
      {showProgress && active ? (
        <div
          className="absolute inset-x-0 bottom-0 h-0.5 bg-black/20"
          aria-hidden
        >
          <div
            className="h-full bg-white/85 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}