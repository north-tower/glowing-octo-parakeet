"use client";

import Link from "next/link";
import { useNakuruApp } from "@/components/app/AppProvider";
import { usePrimaryNav } from "@/components/app/usePrimaryNav";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import {
  IconHeart,
  IconMessageCircle,
  IconShoppingCart,
  IconUser,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";

export function PublicAppNav() {
  const { lang } = usePwaInstall();
  const { dispatch } = useNakuruApp();
  const { highlightTab, cartN, msgUnread, goTab } = usePrimaryNav();

  return (
    <nav className="public-app-nav" aria-label="Primary">
      <button
        type="button"
        className={`public-app-link${highlightTab === "cat" ? " on" : ""}`}
        onClick={() => goTab("cat")}
      >
        {homeCopy("navCategory", lang)}
      </button>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navMessage", lang)}
        onClick={() => goTab("msg")}
      >
        <IconMessageCircle size={20} />
        {msgUnread > 0 ? <span className="public-app-badge">{msgUnread > 9 ? "9+" : msgUnread}</span> : null}
      </button>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navCart", lang)}
        onClick={() => goTab("cart")}
      >
        <IconShoppingCart size={20} />
        {cartN > 0 ? <span className="public-app-badge">{cartN > 9 ? "9+" : cartN}</span> : null}
      </button>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navSaved", lang)}
        onClick={() => dispatch({ type: "ACCOUNT_ROW", id: "acc:saved" })}
      >
        <IconHeart size={20} />
      </button>
      <Link className="btn fl public-app-post" href="/app?start=vendor">
        {homeCopy("postListing", lang)}
      </Link>
      <button
        type="button"
        className={`public-app-icon${highlightTab === "acc" ? " on" : ""}`}
        aria-label={homeCopy("navAccount", lang)}
        onClick={() => goTab("acc")}
      >
        <IconUser size={20} />
      </button>
    </nav>
  );
}
