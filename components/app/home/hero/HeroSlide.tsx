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
      className={`hero-slide ${slide.gradient} hero-slide--${slide.pattern}`}
    >
      <div className="hero-slide-pattern" aria-hidden />
      <div className="hero-slide-inner">
        <div className="hero-slide-copy">
          <h2 className="hero-slide-title">{title}</h2>
          <p className="hero-slide-sub">{subtitle}</p>
          <button
            type="button"
            tabIndex={active ? 0 : -1}
            onClick={onCta}
            data-hero-cta=""
            data-tone={tone}
            className="hero-slide-cta"
          >
            <span className="hero-slide-cta-label">{ctaLabel}</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
        <div className="hero-slide-mark" aria-hidden>
          <Icon className="hero-slide-icon" strokeWidth={1.6} />
        </div>
      </div>
      {showProgress ? (
        <div className="hero-progress" aria-hidden>
          <div
            className="hero-progress-bar"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      ) : null}
    </div>
  );
}
