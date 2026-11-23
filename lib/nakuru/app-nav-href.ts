import type { TabId } from "@/lib/nakuru/types";

/** URL for the in-app category tab (optional drill-in `side` / listing `cat`). */
export function appCategoryHref(opts?: {
  side?: string;
  cat?: string;
}): string {
  const params = new URLSearchParams({ tab: "cat" });
  const side = opts?.side?.trim();
  if (side && side !== "feat") {
    params.set("side", side);
  }
  const cat = opts?.cat?.trim();
  if (cat && cat !== "all") {
    params.set("cat", cat);
  }
  return `/app?${params.toString()}`;
}

type TabHrefOpts = {
  side?: string;
  cat?: string;
  q?: string;
};

/** Canonical `/app` URL for a bottom-nav tab (uses `push` for browser history). */
export function appHrefForTab(tab: TabId, opts?: TabHrefOpts): string {
  if (tab === "home") return "/app";
  if (tab === "cat") {
    return appCategoryHref({ side: opts?.side, cat: opts?.cat });
  }
  const params = new URLSearchParams({ tab });
  const q = opts?.q?.trim();
  if (q) params.set("q", q);
  return `/app?${params.toString()}`;
}