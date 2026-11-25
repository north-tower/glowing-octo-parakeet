"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/nakuru/api";
import { syncLiveListings } from "@/lib/nakuru/catalog-live";
import {
  toProductCardItem,
  type ApiListing,
} from "@/lib/nakuru/listings-map";
import type { Listing } from "@/lib/nakuru/types";

const CACHE_TTL_MS = 30_000;

type CacheEntry = {
  at: number;
  rows: ApiListing[];
};

const responseCache = new Map<string, CacheEntry>();

function cacheKey(category: string | "all" | null | undefined): string {
  if (!category || category === "all") return "all";
  return category;
}

async function fetchListingsCached(
  category?: string | "all" | null,
): Promise<ApiListing[]> {
  const key = cacheKey(category);
  const hit = responseCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.rows;
  }

  const params = new URLSearchParams();
  if (category && category !== "all") {
    params.set("category", category);
  }
  const qs = params.toString();
  const path = qs ? `/api/listings?${qs}` : "/api/listings";

  const rows = await apiFetch<ApiListing[]>(path, {
    skipAuthRetry: true,
    credentials: "omit",
  });

  responseCache.set(key, { at: Date.now(), rows });
  return rows;
}

function listingsMatchQuery(items: Listing[], q: string): Listing[] {
  return items.filter((i) =>
    (i.t + i.s + i.c + (i.categoryLabel ?? "")).toLowerCase().includes(q),
  );
}

export async function fetchListings(opts?: {
  category?: string | "all" | null;
  query?: string;
}): Promise<Listing[]> {
  const apiRows = await fetchListingsCached(opts?.category);
  const items = apiRows.map(toProductCardItem);
  syncLiveListings(items);
  const q = opts?.query?.trim().toLowerCase();
  if (!q) return items;
  return listingsMatchQuery(items, q);
}

export type UseCatalogListingsOpts = {
  enabled: boolean;
  category?: string | "all" | null;
  query?: string;
};

export function useCatalogListings({
  enabled,
  category = "all",
  query = "",
}: UseCatalogListingsOpts) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchListings({ category, query: undefined })
      .then((rows) => {
        if (!cancelled) {
          setItems(rows);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
          setError(
            err instanceof Error ? err.message : "Could not load listings",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return listingsMatchQuery(items, q);
  }, [items, query]);

  return { items: filtered, loading, error };
}