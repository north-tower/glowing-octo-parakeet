"use client";

import { useEffect } from "react";

export function useRevealSections(): void {
  useEffect(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const revealSections = document.querySelectorAll(".reveal-section");

    function revealAllSections() {
      revealSections.forEach((sec) => sec.classList.add("is-revealed"));
    }

    function revealSectionsInView() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      revealSections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) sec.classList.add("is-revealed");
      });
    }

    if (
      revealSections.length &&
      typeof IntersectionObserver !== "undefined" &&
      motionOk
    ) {
      document.documentElement.classList.add("reveal-ready");
      const revealIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              revealIo.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      revealSections.forEach((sec) => revealIo.observe(sec));
      const t1 = window.setTimeout(revealSectionsInView, 1500);
      window.addEventListener("load", revealSectionsInView);
      const t2 = window.setTimeout(revealAllSections, 4000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("load", revealSectionsInView);
        revealIo.disconnect();
      };
    }

    revealAllSections();
  }, []);
}