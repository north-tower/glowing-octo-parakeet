import type { TabId } from "@/lib/nakuru/types";

const STORAGE_KEY = "nh-detail-nav-tab";

export type DetailNavTab = "home" | "cat";

export function persistDetailNavTab(tab: TabId | DetailNavTab): void {
  if (typeof window === "undefined") return;
  const next: DetailNavTab = tab === "cat" ? "cat" : "home";
  try {
    sessionStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

export function readDetailNavTab(): DetailNavTab {
  if (typeof window === "undefined") return "home";
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw === "cat" ? "cat" : "home";
  } catch {
    return "home";
  }
}

/** Bottom nav highlight on product detail: Home or Category only; direct links default Home. */
export function bottomNavHighlightTab(
  tab: TabId,
  onProductDetail: boolean,
): TabId {
  if (!onProductDetail) return tab;
  return readDetailNavTab();
}

export function appHrefForDetailNavTab(tab: DetailNavTab = readDetailNavTab()): string {
  return tab === "cat" ? "/app?tab=cat" : "/app";
}