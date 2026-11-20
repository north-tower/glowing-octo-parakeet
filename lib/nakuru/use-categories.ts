"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/nakuru/api";
import {
  OFFICIAL_DIRECTORY_FALLBACK,
  type DirectoryCategory,
} from "@/lib/nakuru/data/category-directory";
import type { ListingMode } from "@/lib/nakuru/types";

type ApiCategoryRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: ListingMode;
  openForApply: boolean;
  sortOrder: number;
};

function mapApiRow(row: ApiCategoryRow): DirectoryCategory {
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

export function useCategories(): { rows: DirectoryCategory[]; loading: boolean } {
  const [rows, setRows] = useState<DirectoryCategory[]>(OFFICIAL_DIRECTORY_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<ApiCategoryRow[]>("/api/categories", {
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

  return { rows, loading };
}