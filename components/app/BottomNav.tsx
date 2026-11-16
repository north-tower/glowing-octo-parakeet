"use client";

import type { ComponentType } from "react";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { usePrimaryNav } from "@/components/app/usePrimaryNav";
import {
  IconGrid,
  IconHome,
  IconMessageCircle,
  IconShoppingCart,
  IconUser,
} from "@/components/app/icons/LineIcons";
import { APP_TAB_IDS } from "@/lib/nakuru/app-tabs";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
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
  const { lang } = usePwaInstall();
  const { highlightTab, cartN, msgUnread, goTab } = usePrimaryNav();

  return (
    <nav id="nav" className="app-bottom-nav" aria-label="Primary">
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
            onClick={() => goTab(id)}
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