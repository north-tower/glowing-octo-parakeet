"use client";

import { useCallback, useMemo, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { mergeHeroSlides } from "@/lib/nakuru/hero-slide-order";
import { useHomePromotions } from "@/lib/nakuru/use-home-promotions";
import { heroSlides } from "./heroSlides";
import { useCarousel } from "./useCarousel";
import { HeroSlide } from "./HeroSlide";
import { HeroVendorSlide } from "./HeroVendorSlide";
import type { HeroSlideAction } from "./heroSlides";

type HeroCarouselProps = {
  lang: LandingLang;
  enabled: boolean;
  onSlideAction: (action: HeroSlideAction) => void;
};

export function HeroCarousel({
  lang,
  enabled,
  onSlideAction,
}: HeroCarouselProps) {
  const router = useRouter();
  const { promotions } = useHomePromotions(enabled);
  const slides = useMemo(
    () => mergeHeroSlides(heroSlides, promotions),
    [promotions],
  );

  const {
    scrollRef,
    regionRef,
    index,
    userPaused,
    reducedMotion,
    progress,
    next,
    prev,
    goTo,
    setUserPaused,
    setInteractionPaused,
    setDragging,
  } = useCarousel({ slideCount: slides.length, enabled });

  const carouselLabel =
    lang === "sw" ? "Matangazo ya ukurasa wa nyumbani" : "Homepage promotions";

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    },
    [next, prev],
  );

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      aria-live="polite"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setInteractionPaused(true)}
      onPointerLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(e) => {
        if (!regionRef.current?.contains(e.relatedTarget as Node)) {
          setInteractionPaused(false);
        }
      }}
      className="hero-carousel"
    >
      <div
        ref={scrollRef}
        className="hero-carousel-track"
        onPointerDown={() => {
          setDragging(true);
          setInteractionPaused(true);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onTouchStart={() => {
          setDragging(true);
          setInteractionPaused(true);
        }}
        onTouchEnd={() => setDragging(false)}
      >
        {slides.map((entry, i) =>
          entry.kind === "vendor" ? (
            <HeroVendorSlide
              key={entry.slide.id}
              slide={entry.slide}
              slideIndex={i}
              total={slides.length}
              active={i === index}
              lang={lang}
              progress={i === index ? progress : 0}
              reducedMotion={reducedMotion}
              onCta={() => router.push(`/app/p/${entry.slide.productId}`)}
            />
          ) : (
            <HeroSlide
              key={entry.slide.id}
              slide={entry.slide}
              slideIndex={i}
              total={slides.length}
              active={i === index}
              lang={lang}
              tone={entry.slide.tone}
              progress={i === index ? progress : 0}
              reducedMotion={reducedMotion}
              onCta={() => onSlideAction(entry.slide.cta.action)}
            />
          ),
        )}
      </div>

      <button
        type="button"
        className="hero-car-arrow hero-car-arrow--prev"
        aria-label={lang === "sw" ? "Slaidi iliyotangulia" : "Previous slide"}
        onClick={prev}
      >
        <ChevronLeft size={20} aria-hidden />
      </button>
      <button
        type="button"
        className="hero-car-arrow hero-car-arrow--next"
        aria-label={lang === "sw" ? "Slaidi inayofuata" : "Next slide"}
        onClick={next}
      >
        <ChevronRight size={20} aria-hidden />
      </button>

      {!reducedMotion ? (
        <button
          type="button"
          onClick={() => setUserPaused((v) => !v)}
          className="hero-carousel-pause"
          aria-label={
            userPaused
              ? lang === "sw"
                ? "Endeleza kiotomatiki"
                : "Resume autoplay"
              : lang === "sw"
                ? "Simamisha kiotomatiki"
                : "Pause autoplay"
          }
        >
          {userPaused ? (
            <Play className="size-4" strokeWidth={2} aria-hidden />
          ) : (
            <Pause className="size-4" strokeWidth={2} aria-hidden />
          )}
        </button>
      ) : null}

      <div className="hero-dots" role="tablist" aria-label={carouselLabel}>
        {slides.map((entry, i) => (
          <button
            key={entry.kind === "vendor" ? entry.slide.id : entry.slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={
              lang === "sw"
                ? `Slaidi ${i + 1}`
                : `Slide ${i + 1}`
            }
            className={`hero-dot${i === index ? " on" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
