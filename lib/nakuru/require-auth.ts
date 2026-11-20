import { requestPostSignInReturn } from "@/lib/nakuru/post-sign-in-tab";
import type { TabId } from "@/lib/nakuru/types";

export type RequireAuthOptions = {
  /** Tab to reopen inside `/app` after sign-in. */
  tab: TabId;
  /** Defaults to current `location.pathname + search` when omitted. */
  path?: string;
  /** When false, only opens sign-in (e.g. seller onboarding). */
  saveReturn?: boolean;
};

function currentPath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.pathname + window.location.search;
}

/** Returns true when the user is signed in and `action` may run. */
export function requireAuth(
  user: unknown,
  opts: RequireAuthOptions,
  goToSignIn: () => void,
): boolean {
  if (user) return true;

  if (opts.saveReturn !== false) {
    requestPostSignInReturn({
      tab: opts.tab,
      path: opts.path ?? currentPath(),
    });
  }

  goToSignIn();
  return false;
}