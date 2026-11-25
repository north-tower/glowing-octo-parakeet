"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_HOME_FILTERS,
  homeFiltersHref,
  parseHomeFilters,
  type HomeFilters,
} from "@/lib/nakuru/home-filters";

export function useHomeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseHomeFilters(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (patch: Partial<HomeFilters>) => {
      const next = { ...filters, ...patch };
      router.replace(homeFiltersHref(next), { scroll: false });
    },
    [filters, router],
  );

  const clearExtra = useCallback(() => {
    router.replace(
      homeFiltersHref({
        ...DEFAULT_HOME_FILTERS,
        cat: filters.cat,
        q: filters.q,
      }),
      { scroll: false },
    );
  }, [filters.cat, filters.q, router]);

  const clearAll = useCallback(() => {
    router.replace("/app", { scroll: false });
  }, [router]);

  return { filters, setFilters, clearExtra, clearAll };
}
