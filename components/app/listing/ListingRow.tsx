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
};

export function ListingRow({
  children,
  loading,
  skeletonCount = 4,
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
      <div className="flex gap-3 overflow-x-hidden sm:gap-4">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div
            key={i}
            className="w-[44vw] min-w-[160px] shrink-0 sm:w-[220px] lg:w-[240px]"
          >
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="listing-row-root relative col-span-full">
      {finePointer && canPrev ? (
        <button
          type="button"
          className="absolute left-0 top-[calc(50%-24px)] z-10 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-md disabled:opacity-40 [@media(hover:hover)]:inline-flex"
          aria-label="Scroll listings left"
          disabled={!canPrev}
          onClick={() => scrollByViewport(-1)}
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
      ) : null}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {finePointer && canNext ? (
        <>
          <div
            className="pointer-events-none absolute bottom-2 right-0 top-0 z-[1] w-10 bg-gradient-to-l from-[var(--bg)] to-transparent"
            aria-hidden
          />
          <button
            type="button"
            className="absolute right-0 top-[calc(50%-24px)] z-10 hidden h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-md disabled:opacity-40 [@media(hover:hover)]:inline-flex"
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
    <div className="flex w-[44vw] min-w-[160px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]">
      <div className="flex min-h-0 w-full">{children}</div>
    </div>
  );
}