import type { TabId } from "@/lib/nakuru/types";

const TAB_KEY = "nh:postSignInTab";
const PATH_KEY = "nh:postSignInPath";

const TABS: TabId[] = ["home", "cat", "msg", "cart", "acc"];

export type PostSignInReturn = {
  tab: TabId | null;
  path: string | null;
};

function safeReturnPath(path: string): string | null {
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/\\") || path.includes("://")) return null;
  if (!path.startsWith("/app")) return null;
  return path;
}

/** Same-origin in-app path from a `returnTo` query value. */
export function parseReturnToParam(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw.trim());
    return safeReturnPath(decoded);
  } catch {
    return null;
  }
}

export function signInHref(returnTo?: string | null): string {
  const path = returnTo ? parseReturnToParam(returnTo) : null;
  if (!path) return "/auth/sign-in";
  return `/auth/sign-in?returnTo=${encodeURIComponent(path)}`;
}

/** Remember where to send the shopper after in-app sign-in. */
export function requestPostSignInReturn(opts: {
  tab?: TabId;
  path?: string;
}): void {
  try {
    if (opts.tab) sessionStorage.setItem(TAB_KEY, opts.tab);
    if (opts.path) {
      const safe = safeReturnPath(opts.path);
      if (safe) sessionStorage.setItem(PATH_KEY, safe);
    }
  } catch {
    /* unavailable */
  }
}

export function requestPostSignInTab(tab: TabId): void {
  requestPostSignInReturn({ tab });
}

export function consumePostSignInReturn(): PostSignInReturn {
  let tab: TabId | null = null;
  let path: string | null = null;
  try {
    const rawTab = sessionStorage.getItem(TAB_KEY);
    sessionStorage.removeItem(TAB_KEY);
    if (rawTab && TABS.includes(rawTab as TabId)) {
      tab = rawTab as TabId;
    }

    const rawPath = sessionStorage.getItem(PATH_KEY);
    sessionStorage.removeItem(PATH_KEY);
    if (rawPath) path = safeReturnPath(rawPath);
  } catch {
    /* unavailable */
  }
  return { tab, path };
}

export function consumePostSignInTab(): TabId | null {
  return consumePostSignInReturn().tab;
}