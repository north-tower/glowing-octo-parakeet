"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/nakuru/api";
import {
  OFFICIAL_DIRECTORY_FALLBACK,
  type DirectoryCategory,
} from "@/lib/nakuru/data/category-directory";
import type { ListingMode } from "@/lib/nakuru/types";

export type CategoryPublicApiRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: ListingMode;
  openForApply: boolean;
  sortOrder: number;
};

function mapApiRow(row: CategoryPublicApiRow): DirectoryCategory {
  return {
    slug: row.slug,
    label: row.label,
    kind: row.kind,
    listingMode: row.listingMode,
    visible: true,
    openForApply: row.openForApply,
    sortOrder: row.sortOrder,
  };
}

export function useCategories(): {
  rows: DirectoryCategory[];
  loading: boolean;
  upsertRow: (row: CategoryPublicApiRow) => void;
} {
  const [rows, setRows] = useState<DirectoryCategory[]>(OFFICIAL_DIRECTORY_FALLBACK);
  const [loading, setLoading] = useState(true);

  const upsertRow = useCallback((row: CategoryPublicApiRow) => {
    const mapped = mapApiRow(row);
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.slug === mapped.slug);
      const next =
        idx >= 0
          ? [...prev.slice(0, idx), mapped, ...prev.slice(idx + 1)]
          : [...prev, mapped];
      return [...next].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<CategoryPublicApiRow[]>("/api/categories", {
          skipAuthRetry: true,
        });
        if (!cancelled && Array.isArray(data)) {
          setRows(data.map(mapApiRow));
        }
      } catch {
        if (!cancelled) {
          setRows(OFFICIAL_DIRECTORY_FALLBACK);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rows, loading, upsertRow };
}