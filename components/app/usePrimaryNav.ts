"use client";

import { usePathname, useRouter } from "next/navigation";
import { useNakuruApp } from "@/components/app/AppProvider";
import {
  appHrefForDetailNavTab,
  bottomNavHighlightTab,
  persistDetailNavTab,
} from "@/lib/nakuru/detail-nav-tab";
import { appHrefForTab } from "@/lib/nakuru/app-nav-href";
import { cartCount } from "@/lib/nakuru/reducer";
import type { TabId } from "@/lib/nakuru/types";

export function usePrimaryNav() {
  const { state, dispatch } = useNakuruApp();
  const pathname = usePathname();
  const router = useRouter();
  const onDetailRoute = pathname?.startsWith("/app/p/");
  const highlightTab = bottomNavHighlightTab(state.tab, onDetailRoute);
  const cartN = cartCount(state.cart);
  const msgUnread =
    "msgUnread" in state &&
    typeof (state as { msgUnread?: number }).msgUnread === "number"
      ? (state as { msgUnread: number }).msgUnread
      : 0;

  const onAppShell = pathname === "/app";

  const goTab = (id: TabId) => {
    const href = onDetailRoute
      ? id === "home" || id === "cat"
        ? appHrefForDetailNavTab(id === "cat" ? "cat" : "home")
        : `/app?tab=${id}`
      : onAppShell
        ? appHrefForTab(id, {
            side: id === "cat" ? state.side : undefined,
            cat: state.cat,
            q: state.q,
          })
        : null;

    if (onDetailRoute) persistDetailNavTab(id);
    if (href) router.push(href);
    dispatch({ type: "SET_TAB", tab: id });
  };

  const goHome = () => goTab("home");

  return {
    highlightTab,
    cartN,
    msgUnread,
    goTab,
    goHome,
    onDetailRoute,
  };
}