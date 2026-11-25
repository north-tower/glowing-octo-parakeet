"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
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
  const hasPhoto = Boolean(slide.imageUrl?.trim());
  const photoSrc = slide.imageUrl?.trim() ?? "";
  const optimizable = hasPhoto && isOptimizablePhotoUrl(photoSrc);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${total}`}
      aria-hidden={!active}
      className="relative flex min-h-[220px] w-full shrink-0 snap-start snap-always flex-col overflow-hidden rounded-3xl text-white sm:min-h-[280px]"
    >
      <div
        className={`absolute inset-0 ${
          hasPhoto
            ? "bg-gradient-to-br from-[#052826] via-[#073b39] to-[#0a524e]"
            : "bg-gradient-to-br from-[#073b39] via-[#0a524e] to-[#0d6f69]"
        }`}
        aria-hidden
      />
      {hasPhoto ? (
        <div className="absolute inset-0" aria-hidden>
          {optimizable ? (
            <Image
              src={photoSrc}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              priority={slideIndex === 1}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              className="size-full object-cover"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#041a19]/92 via-[#052826]/78 to-[#052826]/35" />
        </div>
      ) : null}

      <div className="relative z-20 flex min-h-[inherit] w-full flex-1 flex-col justify-center p-6 pb-10 sm:p-10">
        <div className="flex min-w-0 max-w-xl flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 items-center rounded-full bg-white/15 px-3 text-xs font-semibold uppercase tracking-wide text-white/95 ring-1 ring-white/25">
              {featuredLabel}
            </span>
            {slide.verified ? (
              <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-200/30">
                <BadgeCheck className="size-3.5" aria-hidden />
                {homeCopy("heroVendorVerified", lang)}
              </span>
            ) : null}
          </div>
          <div
            className="transition-opacity duration-300"
            style={{ opacity: active ? 1 : 0.92 }}
          >
            <h2 className="hero-slide-title m-0 text-balance !text-2xl !font-semibold leading-tight tracking-tight sm:!text-4xl lg:!text-5xl">
              {slide.title}
            </h2>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              {slide.subtitle}
            </p>
          </div>
          <div>
            <button
              type="button"
              tabIndex={active ? 0 : -1}
              onClick={onCta}
              data-hero-cta=""
              data-tone="dark"
              className="hero-slide-cta relative z-20 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-md ring-1 ring-black/10 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <span className="hero-slide-cta-label">{ctaLabel}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {showProgress ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1 bg-white/20"
          aria-hidden
        >
          <div
            key={`progress-v-${slideIndex}`}
            className="h-full w-full origin-left bg-white/80 will-change-transform"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      ) : null}
    </div>
  );
}