"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/nakuru/api";
import type { HomeHeroPromotion } from "@/lib/nakuru/home-promotions";

export function useHomePromotions(enabled: boolean) {
  const [promotions, setPromotions] = useState<HomeHeroPromotion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    apiFetch<HomeHeroPromotion[]>("/api/home/promotions", {
      skipAuthRetry: true,
      credentials: "omit",
    })
      .then((rows) => {
        if (!cancelled) {
          setPromotions(Array.isArray(rows) ? rows : []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPromotions([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { promotions, loaded };
}