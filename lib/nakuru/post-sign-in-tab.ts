import type { TabId } from "@/lib/nakuru/types";

const KEY = "nh:postSignInTab";

export function requestPostSignInTab(tab: TabId): void {
  try {
    sessionStorage.setItem(KEY, tab);
  } catch {
    /* unavailable */
  }
}

export function consumePostSignInTab(): TabId | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (raw === "home" || raw === "cat" || raw === "msg" || raw === "cart" || raw === "acc") {
      return raw;
    }
  } catch {
    /* unavailable */
  }
  return null;
}