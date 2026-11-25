"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCardSkeleton } from "@/components/app/listing/ListingCardSkeleton";

type Props = {
  children: ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  ariaLabel?: string;
};

export function ListingRow({
  children,
  loading,
  skeletonCount = 4,
  ariaLabel,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    const onScroll = () => syncEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => syncEdges());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [syncEdges, loading]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const scrollByViewport = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="lc-rail lc-rail--loading" aria-busy="true" aria-label={ariaLabel}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className="lc-rail-slot">
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="listing-row-root lc-rail-wrap"
      aria-label={ariaLabel}
    >
      {finePointer && canPrev ? (
        <button
          type="button"
          className="lc-rail-arrow lc-rail-arrow--prev"
          aria-label="Scroll listings left"
          disabled={!canPrev}
          onClick={() => scrollByViewport(-1)}
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
      ) : null}
      <div
        ref={scrollerRef}
        className="lc-rail"
      >
        {children}
      </div>
      {finePointer && canNext ? (
        <>
          <div
            className="lc-rail-fade"
            aria-hidden
          />
          <button
            type="button"
            className="lc-rail-arrow lc-rail-arrow--next"
            aria-label="Scroll listings right"
            disabled={!canNext}
            onClick={() => scrollByViewport(1)}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}

export function ListingRowItem({ children }: { children: ReactNode }) {
  return (
    <div className="lc-rail-slot">
      {children}
    </div>
  );
}