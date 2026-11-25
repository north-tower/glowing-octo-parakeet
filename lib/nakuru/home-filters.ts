import { listingModeOf } from "@/lib/nakuru/listing-mode";
import type { Listing, ListingMode } from "@/lib/nakuru/types";

export type HomeSort = "newest" | "price-asc" | "price-desc" | "nearest";

export type HomeFilters = {
  cat: string;
  q: string;
  sort: HomeSort;
  verified: boolean;
  type: ListingMode | "";
  min: number | null;
  max: number | null;
};

const SORTS = new Set<HomeSort>([
  "newest",
  "price-asc",
  "price-desc",
  "nearest",
]);

const TYPES = new Set<ListingMode>(["shop", "services", "property", "cars"]);

export const DEFAULT_HOME_FILTERS: HomeFilters = {
  cat: "all",
  q: "",
  sort: "newest",
  verified: false,
  type: "",
  min: null,
  max: null,
};

function parseNum(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parseHomeFilters(
  params: Pick<URLSearchParams, "get">,
): HomeFilters {
  const cat = params.get("cat")?.trim() || "all";
  const q = params.get("q")?.trim() ?? "";
  const sortRaw = params.get("sort");
  const sort = sortRaw && SORTS.has(sortRaw as HomeSort)
    ? (sortRaw as HomeSort)
    : "newest";
  const typeRaw = params.get("type");
  const type =
    typeRaw && TYPES.has(typeRaw as ListingMode)
      ? (typeRaw as ListingMode)
      : "";
  const verified =
    params.get("verified") === "1" || params.get("verified") === "true";
  return {
    cat,
    q,
    sort,
    verified,
    type,
    min: parseNum(params.get("min")),
    max: parseNum(params.get("max")),
  };
}

export function homeFiltersHref(
  filters: Partial<HomeFilters>,
  extras?: { tab?: string },
): string {
  const next: HomeFilters = { ...DEFAULT_HOME_FILTERS, ...filters };
  const p = new URLSearchParams();
  if (extras?.tab && extras.tab !== "home") p.set("tab", extras.tab);
  if (next.cat && next.cat !== "all") p.set("cat", next.cat);
  if (next.q) p.set("q", next.q);
  if (next.sort && next.sort !== "newest") p.set("sort", next.sort);
  if (next.verified) p.set("verified", "1");
  if (next.type) p.set("type", next.type);
  if (next.min != null) p.set("min", String(next.min));
  if (next.max != null) p.set("max", String(next.max));
  const qs = p.toString();
  return qs ? `/app?${qs}` : "/app";
}

export function homeFiltersAreActive(filters: HomeFilters): boolean {
  return (
    filters.verified ||
    Boolean(filters.type) ||
    filters.min != null ||
    filters.max != null ||
    (filters.sort !== "newest" && Boolean(filters.sort))
  );
}

/** Extra filters that replace the landing feed with the results grid. */
export function homeFiltersLeaveLanding(filters: HomeFilters): boolean {
  return (
    filters.verified ||
    Boolean(filters.type) ||
    filters.min != null ||
    filters.max != null
  );
}

export function countActiveHomeFilters(filters: HomeFilters): number {
  let n = 0;
  if (filters.verified) n += 1;
  if (filters.type) n += 1;
  if (filters.min != null || filters.max != null) n += 1;
  if (filters.sort !== "newest") n += 1;
  return n;
}

function locOf(item: Listing): string {
  return (
    item.attrs?.location ??
    item.attrs?.area ??
    item.s
  ).toLowerCase();
}

export function applyHomeFilters(
  items: Listing[],
  filters: HomeFilters,
  zoneLabel?: string,
): Listing[] {
  let rows = items;
  if (filters.verified) {
    rows = rows.filter((i) => i.v === 1);
  }
  if (filters.type) {
    rows = rows.filter((i) => listingModeOf(i) === filters.type);
  }
  if (filters.min != null) {
    const min = filters.min;
    rows = rows.filter((i) => i.p >= min);
  }
  if (filters.max != null) {
    const max = filters.max;
    rows = rows.filter((i) => i.p <= max);
  }

  if (filters.sort === "price-asc") {
    return [...rows].sort((a, b) => a.p - b.p);
  }
  if (filters.sort === "price-desc") {
    return [...rows].sort((a, b) => b.p - a.p);
  }
  if (filters.sort === "nearest") {
    const zone = (zoneLabel ?? "").toLowerCase();
    if (!zone) return rows;
    return [...rows].sort((a, b) => {
      const aHit = locOf(a).includes(zone) ? 0 : 1;
      const bHit = locOf(b).includes(zone) ? 0 : 1;
      return aHit - bHit;
    });
  }
  return rows;
}
