"use client";

import { useCallback, useEffect, useMemo, type KeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { HomeHeroPromotion } from "@/lib/nakuru/home-promotions";
import { mergeHeroSlides } from "@/lib/nakuru/hero-slide-order";
import { heroSlides } from "./heroSlides";
import { useCarousel } from "./useCarousel";
import { HeroSlide } from "./HeroSlide";
import { HeroVendorSlide } from "./HeroVendorSlide";
import type { HeroSlideAction } from "./heroSlides";

type HeroCarouselProps = {
  lang: LandingLang;
  enabled: boolean;
  vendorPromotions: HomeHeroPromotion[];
  onSlideAction: (action: HeroSlideAction) => void;
  onVendorListing: (productId: string) => void;
};

export function HeroCarousel({
  lang,
  enabled,
  vendorPromotions,
  onSlideAction,
  onVendorListing,
}: HeroCarouselProps) {
  const merged = useMemo(
    () => mergeHeroSlides(heroSlides, vendorPromotions),
    [vendorPromotions],
  );

  const {
    scrollRef,
    regionRef,
    index,
    paused,
    userPaused,
    reducedMotion,
    progress,
    next,
    prev,
    setUserPaused,
    setInteractionPaused,
    setDragging,
  } = useCarousel({ slideCount: merged.length, enabled });

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      el.scrollLeft = index * el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, scrollRef]);

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      aria-live={paused ? "polite" : "off"}
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
      className="group/hero relative h-full min-h-[220px] rounded-3xl outline-none sm:min-h-[280px] focus-visible:ring-2 focus-visible:ring-[#0d6f69] focus-visible:ring-offset-2"
    >
      <style>{`
        .hero-slide-title {
          font-weight: 600;
          letter-spacing: -0.025em;
        }
      `}</style>
      <div
        ref={scrollRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
        {merged.map((entry, i) => {
          if (entry.kind === "platform") {
            const slide = entry.slide;
            return (
              <HeroSlide
                key={slide.id}
                slide={slide}
                slideIndex={i}
                total={merged.length}
                active={i === index}
                lang={lang}
                tone={slide.tone}
                progress={i === index ? progress : 0}
                reducedMotion={reducedMotion}
                onCta={() => onSlideAction(slide.cta.action)}
              />
            );
          }
          const slide = entry.slide;
          return (
            <HeroVendorSlide
              key={`vendor-${slide.id}`}
              slide={slide}
              slideIndex={i}
              total={merged.length}
              active={i === index}
              lang={lang}
              progress={i === index ? progress : 0}
              reducedMotion={reducedMotion}
              onCta={() => onVendorListing(slide.productId)}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setUserPaused((v) => !v)}
        className="hero-carousel-pause pointer-events-auto absolute bottom-5 right-6 z-20 flex size-11 items-center justify-center rounded-full border-0 bg-white/20 text-white shadow-none ring-1 ring-white/40 backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:right-10 [&_svg]:text-white"
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
          <Play className="size-9 text-white" strokeWidth={2} aria-hidden />
        ) : (
          <Pause className="size-9 text-white" strokeWidth={2} aria-hidden />
        )}
      </button>

      {merged.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={lang === "sw" ? "Tangazo lililopita" : "Previous slide"}
            className="pointer-events-auto absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#081816]/70 text-white opacity-0 transition hover:bg-[#081816]/85 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent [@media(hover:hover)]:group-hover/hero:opacity-100 [@media(hover:hover)]:group-focus-within/hero:opacity-100 [@media(hover:hover)]:grid [@media(hover:none)]:hidden"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={lang === "sw" ? "Tangazo linalofuata" : "Next slide"}
            className="pointer-events-auto absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#081816]/70 text-white opacity-0 transition hover:bg-[#081816]/85 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent [@media(hover:hover)]:group-hover/hero:opacity-100 [@media(hover:hover)]:group-focus-within/hero:opacity-100 [@media(hover:hover)]:grid [@media(hover:none)]:hidden"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}