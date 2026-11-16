"use client";

import { useEffect, type RefObject } from "react";

export function useStickyBarHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--sticky-bar-h", `${h}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--sticky-bar-h");
    };
  }, [ref]);
}