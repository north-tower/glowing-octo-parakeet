"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck, Store } from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { isOptimizablePhotoUrl } from "@/lib/nakuru/listing-image";
import type { HomeHeroPromotion } from "@/lib/nakuru/home-promotions";

type HeroVendorSlideProps = {
  slide: HomeHeroPromotion;
  slideIndex: number;
  total: number;
  active: boolean;
  lang: LandingLang;
  progress: number;
  reducedMotion: boolean;
  onCta: () => void;
};

export function HeroVendorSlide({
  slide,
  slideIndex,
  total,
  active,
  lang,
  progress,
  reducedMotion,
  onCta,
}: HeroVendorSlideProps) {
  const ctaLabel = homeCopy("heroVendorCta", lang);
  const featuredLabel = homeCopy("heroVendorFeatured", lang);
  const showProgress = active && !reducedMotion;
  const photoSrc = slide.imageUrl?.trim() ?? "";
  const hasPhoto = Boolean(photoSrc);
  const optimizable = hasPhoto && isOptimizablePhotoUrl(photoSrc);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${total}`}
      aria-hidden={!active}
      className="hero-slide sl--hero-vendor hero-slide--waves"
    >
      {hasPhoto ? (
        <>
          {optimizable ? (
            <Image
              className="hero-slide-photo"
              src={photoSrc}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, (min-width: 1536px) 960px, 72vw"
              priority={slideIndex === 0}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-slide-photo" src={photoSrc} alt="" />
          )}
          <div className="hero-slide-photo-scrim" aria-hidden />
        </>
      ) : (
        <div className="hero-slide-pattern" aria-hidden />
      )}
      <div className="hero-slide-inner">
        <div className="hero-slide-copy">
          <p className="hero-slide-kicker">
            {featuredLabel}
            {slide.verified ? (
              <>
                <BadgeCheck size={14} aria-hidden />
                {homeCopy("heroVendorVerified", lang)}
              </>
            ) : null}
          </p>
          <h2 className="hero-slide-title">{slide.title}</h2>
          <p className="hero-slide-sub">{slide.subtitle}</p>
          <button
            type="button"
            tabIndex={active ? 0 : -1}
            onClick={onCta}
            data-hero-cta=""
            data-tone="dark"
            className="hero-slide-cta"
          >
            <span className="hero-slide-cta-label">{ctaLabel}</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
        <div className="hero-slide-mark" aria-hidden>
          <Store className="hero-slide-icon" strokeWidth={1.6} />
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
