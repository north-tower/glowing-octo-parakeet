"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { HERO_AUTOPLAY_MS } from "./heroSlides";

type UseCarouselOptions = {
  slideCount: number;
  enabled: boolean;
  autoplayMs?: number;
};

type UseCarouselResult = {
  scrollRef: RefObject<HTMLDivElement | null>;
  regionRef: RefObject<HTMLDivElement | null>;
  index: number;
  paused: boolean;
  userPaused: boolean;
  reducedMotion: boolean;
  progress: number;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  setUserPaused: Dispatch<SetStateAction<boolean>>;
  setInteractionPaused: (v: boolean) => void;
  setDragging: (v: boolean) => void;
};

function clampIndex(i: number, count: number) {
  if (count <= 0) return 0;
  return ((i % count) + count) % count;
}

export function useCarousel({
  slideCount,
  enabled,
  autoplayMs = HERO_AUTOPLAY_MS,
}: UseCarouselOptions): UseCarouselResult {
  const scrollRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const indexRef = useRef(0);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressStartRef = useRef(0);
  const [tabHidden, setTabHidden] = useState(false);
  const onscreenRef = useRef(true);

  indexRef.current = index;

  const paused =
    userPaused ||
    interactionPaused ||
    dragging ||
    tabHidden ||
    reducedMotion;

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    const next = clampIndex(i, slideCount);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
      setProgress(0);
      progressStartRef.current = performance.now();
    }
  }, [slideCount]);

  const goTo = useCallback(
    (i: number) => {
      const el = scrollRef.current;
      if (!el || slideCount === 0) return;
      const target = clampIndex(i, slideCount);
      el.scrollTo({
        left: target * el.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      indexRef.current = target;
      setIndex(target);
      setProgress(0);
      progressStartRef.current = performance.now();
    },
    [reducedMotion, slideCount],
  );

  const next = useCallback(() => {
    goTo(indexRef.current + 1);
  }, [goTo]);

  const prev = useCallback(() => {
    goTo(indexRef.current - 1);
  }, [goTo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncIndexFromScroll);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("scroll", onScroll);
    };
  }, [enabled, syncIndexFromScroll]);

  useEffect(() => {
    setTabHidden(document.hidden);
    const onVisibility = () => {
      setTabHidden(document.hidden);
      if (!document.hidden) {
        progressStartRef.current = performance.now();
        setProgress(0);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        onscreenRef.current = Boolean(entry?.isIntersecting);
        progressStartRef.current = performance.now();
        setProgress(0);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || reducedMotion || slideCount <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    progressStartRef.current = performance.now();

    const tick = () => {
      if (paused || !onscreenRef.current || !scrollRef.current) {
        return;
      }
      const elapsed = performance.now() - progressStartRef.current;
      const p = Math.min(1, elapsed / autoplayMs);
      setProgress(p);
      if (elapsed >= autoplayMs) {
        goTo(indexRef.current + 1);
      }
    };

    timerRef.current = setInterval(tick, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoplayMs, enabled, goTo, paused, reducedMotion, slideCount]);

  useEffect(() => {
    if (!paused && !reducedMotion) {
      progressStartRef.current = performance.now();
      setProgress(0);
    }
  }, [index, paused, reducedMotion]);

  return {
    scrollRef,
    regionRef,
    index,
    paused,
    userPaused,
    reducedMotion,
    progress,
    goTo,
    next,
    prev,
    setUserPaused,
    setInteractionPaused,
    setDragging,
  };
}