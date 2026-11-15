"use client";

import { useEffect } from "react";

export function useMobileCtaBar(): void {
  useEffect(() => {
    const mobileBar = document.getElementById("mobile-cta-bar");
    const heroCta = document.getElementById("hero-cta");
    const ctaFinal = document.getElementById("cta-final");
    if (!mobileBar || typeof IntersectionObserver === "undefined") return;

    let barHeroVisible = true;
    let barFinalVisible = false;

    function syncMobileBar() {
      const hide = barHeroVisible || barFinalVisible;
      mobileBar!.classList.toggle("is-hidden", hide);
    }

    const observers: IntersectionObserver[] = [];

    if (heroCta) {
      const heroIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            barHeroVisible = entry.isIntersecting;
            syncMobileBar();
          });
        },
        { root: null, threshold: 0, rootMargin: "0px" },
      );
      heroIo.observe(heroCta);
      observers.push(heroIo);
    }

    if (ctaFinal) {
      const finalIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            barFinalVisible = entry.isIntersecting;
            syncMobileBar();
          });
        },
        { root: null, threshold: 0.08 },
      );
      finalIo.observe(ctaFinal);
      observers.push(finalIo);
    }

    syncMobileBar();

    return () => observers.forEach((o) => o.disconnect());
  }, []);
}