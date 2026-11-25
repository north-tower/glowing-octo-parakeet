"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  CategoryIcon,
  isCategoryIconKey,
  type CategoryIconKey,
} from "@/lib/nakuru/category-icons";
import {
  IconChevronLeft,
  IconHeart,
  IconShare2,
  IconX,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import {
  isOptimizablePhotoUrl,
  LISTING_BLUR_DATA_URL,
  productImageSizes,
} from "@/lib/nakuru/listing-image";

type Props = {
  title: string;
  gallery: string[];
  tint: string;
  icon: CategoryIconKey | string;
  containHero?: boolean;
  lang: LandingLang;
  backHref: string;
  saved: boolean;
  onShare: () => void;
  onSave: () => void;
};

function isIconKey(icon: string): icon is CategoryIconKey {
  return isCategoryIconKey(icon);
}

export function ListingGallery({
  title,
  gallery,
  tint,
  icon,
  containHero,
  lang,
  backHref,
  saved,
  onShare,
  onSave,
}: Props) {
  const labelId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);
  const iconKey: CategoryIconKey = isIconKey(icon) ? icon : "grid";
  const slides = gallery.length ? gallery : [null];

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => {
      const w = node.clientWidth || 1;
      setIndex(Math.round(node.scrollLeft / w));
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [gallery.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const count = gallery.length;
  const src = (i: number) => gallery[i];
  const showPhoto = (i: number) => Boolean(src(i) && !failed[i]);

  return (
    <div className={`pd-gallery-wrap pd-gallery-wrap--${tint}`}>
      <div
        className="pd-gallery-scrim"
        aria-hidden
      />
      <div
        className="pd-gallery"
        ref={scrollerRef}
        role="region"
        aria-labelledby={labelId}
      >
        <span id={labelId} className="sr-only">
          {title}
        </span>
        {slides.map((_, i) => (
          <button
            type="button"
            className={`pd-gallery-slide${containHero ? " pd-gallery-slide--contain" : ""}`}
            key={`${src(i) ?? "empty"}-${i}`}
            onClick={() => {
              if (showPhoto(i)) setLightbox(true);
            }}
            aria-label={
              showPhoto(i) ? `${title}, photo ${i + 1}` : title
            }
          >
            {showPhoto(i) && src(i) ? (
              <Image
                src={src(i)!}
                alt={i === 0 ? title : `${title} ${i + 1}`}
                fill
                sizes={productImageSizes("hero")}
                priority={i === 0}
                placeholder="blur"
                blurDataURL={LISTING_BLUR_DATA_URL}
                unoptimized={!isOptimizablePhotoUrl(src(i)!)}
                className={
                  containHero ? "pd-gallery-img pd-gallery-img--contain" : "pd-gallery-img"
                }
                onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
              />
            ) : (
              <span className="pim-fallback" aria-hidden>
                <CategoryIcon icon={iconKey} size={48} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pd-overlay">
        <Link
          href={backHref}
          className="pd-icon-btn"
          aria-label={homeCopy("productBackAria", lang)}
        >
          <IconChevronLeft size={22} />
        </Link>
        <div className="pd-overlay-end">
          <button
            type="button"
            className="pd-icon-btn"
            aria-label={homeCopy("productShareAria", lang)}
            onClick={onShare}
          >
            <IconShare2 size={22} />
          </button>
          <button
            type="button"
            className={`pd-icon-btn${saved ? " pd-icon-btn--saved" : ""}`}
            aria-pressed={saved}
            aria-label={
              saved
                ? homeCopy("productUnsaveAria", lang)
                : homeCopy("productSaveAria", lang)
            }
            onClick={onSave}
          >
            <IconHeart size={22} />
          </button>
        </div>
      </div>

      {count > 1 ? (
        <span className="pd-gallery-pill" aria-live="polite">
          {index + 1}/{count}
        </span>
      ) : null}

      {lightbox && showPhoto(index) && src(index) ? (
        <div
          className="pd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            className="pd-lightbox-close"
            aria-label={homeCopy("productLightboxClose", lang)}
            onClick={() => setLightbox(false)}
          >
            <IconX size={22} />
          </button>
          <div className="pd-lightbox-stage">
            <Image
              src={src(index)!}
              alt={title}
              fill
              sizes="100vw"
              priority
              unoptimized={!isOptimizablePhotoUrl(src(index)!)}
              className="pd-lightbox-img"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
