"use client";

import { useCallback, useMemo, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { heroSlides } from "./heroSlides";
import { useCarousel } from "./useCarousel";
import { HeroSlide } from "./HeroSlide";
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
  const slides = useMemo(() => heroSlides, []);

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
        {slides.map((slide, i) => (
          <HeroSlide
            key={slide.id}
            slide={slide}
            slideIndex={i}
            total={slides.length}
            active={i === index}
            lang={lang}
            tone={slide.tone}
            progress={i === index ? progress : 0}
            reducedMotion={reducedMotion}
            onCta={() => onSlideAction(slide.cta.action)}
          />
        ))}
      </div>

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
        {slides.map((slide, i) => (
          <button
            key={slide.id}
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
