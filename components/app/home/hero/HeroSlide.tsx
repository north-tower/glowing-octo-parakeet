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
  reducedMotion: boolean;
  onCta: () => void;
};

function textColor(tone: HeroSlideTone) {
  return tone === "dark" ? "text-white" : "text-stone-900";
}

function subtitleColor(tone: HeroSlideTone) {
  return tone === "dark" ? "text-white/90" : "text-stone-700";
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
  reducedMotion,
  onCta,
}: HeroSlideProps) {
  const Icon = slide.icon;
  const title = homeCopy(slide.titleKey, lang);
  const subtitle = homeCopy(slide.subtitleKey, lang);
  const ctaLabel = homeCopy(slide.cta.labelKey, lang);

  const showProgress = active && !reducedMotion;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${total}`}
      aria-hidden={!active}
      className={`relative flex min-h-[220px] w-full shrink-0 snap-start snap-always flex-col overflow-hidden rounded-3xl sm:min-h-[280px] ${slide.gradient} ${textColor(tone)}`}
    >
      <div className="relative z-20 flex min-h-[inherit] w-full flex-1 flex-col justify-center p-6 pb-10 sm:p-10">
        <div className="flex w-full min-w-0 items-center justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-3 sm:max-w-[58%] sm:gap-4">
            <div>
              <h2 className="hero-slide-title m-0 max-w-none text-balance !text-2xl !font-semibold leading-tight tracking-tight sm:max-w-[18ch] sm:!text-4xl lg:!text-5xl">
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
                data-hero-cta=""
                data-tone={tone}
                className={`hero-slide-cta relative z-20 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${ctaClasses(tone)} ${
                  tone === "dark"
                    ? "ring-black/10"
                    : "ring-white/25"
                }`}
              >
                <span className="hero-slide-cta-label">{ctaLabel}</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </button>
            </div>
          </div>
          <div className="hidden shrink-0 sm:block" aria-hidden>
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-md">
              <Icon
                className={`size-9 ${slide.iconColorClass}`}
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
      {showProgress ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1 bg-white/20"
          aria-hidden
        >
          <div
            key={`progress-${slideIndex}`}
            className="h-full w-full origin-left bg-white/80 will-change-transform"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      ) : null}
    </div>
  );
}