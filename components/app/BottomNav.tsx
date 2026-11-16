"use client";

import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNakuruApp } from "@/components/app/AppProvider";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import {
  IconGrid,
  IconHome,
  IconMessageCircle,
  IconShoppingCart,
  IconUser,
} from "@/components/app/icons/LineIcons";
import { BRAND_NAME } from "@/lib/nakuru/brand";
import { APP_TAB_IDS } from "@/lib/nakuru/app-tabs";
import {
  appHrefForDetailNavTab,
  bottomNavHighlightTab,
  persistDetailNavTab,
} from "@/lib/nakuru/detail-nav-tab";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import { cartCount } from "@/lib/nakuru/reducer";
import type { TabId } from "@/lib/nakuru/types";

const TAB_ICONS: Record<
  TabId,
  ComponentType<{ size?: number }>
> = {
  home: IconHome,
  cat: IconGrid,
  msg: IconMessageCircle,
  cart: IconShoppingCart,
  acc: IconUser,
};

const TAB_LABEL_KEYS: Record<TabId, HomeCopyKey> = {
  home: "navHome",
  cat: "navCategory",
  msg: "navMessage",
  cart: "navCart",
  acc: "navAccount",
};

function formatBadge(n: number): string {
  if (n <= 0) return "";
  return n > 9 ? "9+" : String(n);
}

export function BottomNav() {
  const { state, dispatch } = useNakuruApp();
  const { lang } = usePwaInstall();
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

  return (
    <nav id="nav" className="app-bottom-nav" aria-label="Primary">
      <div className="app-nav-brand">
        <span className="logo">
          <BrandLogoMark size={22} />
          {BRAND_NAME}
        </span>
      </div>
      {APP_TAB_IDS.map((id) => {
        const active = highlightTab === id;
        const Icon = TAB_ICONS[id];
        const badge =
          id === "cart"
            ? cartN
            : id === "msg"
              ? msgUnread
              : 0;
        const badgeText = formatBadge(badge);

        return (
          <button
            key={id}
            type="button"
            className={active ? "on" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (onDetailRoute) {
                persistDetailNavTab(id);
                router.push(
                  id === "home" || id === "cat"
                    ? appHrefForDetailNavTab(
                        id === "cat" ? "cat" : "home",
                      )
                    : `/app?tab=${id}`,
                );
              }
              dispatch({ type: "SET_TAB", tab: id });
            }}
          >
            <span className="nav-tab-inner">
              <span className="nav-tab-icon-wrap" data-badge={badgeText || undefined}>
                <span className="nav-tab-pill">
                  <Icon size={24} />
                </span>
                {badgeText ? (
                  <span className="nav-tab-badge" aria-hidden>
                    {badgeText}
                  </span>
                ) : null}
              </span>
              <span className="nav-tab-label">
                {homeCopy(TAB_LABEL_KEYS[id], lang)}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}