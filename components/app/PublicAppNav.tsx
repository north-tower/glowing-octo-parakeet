"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { homeFiltersHref } from "@/lib/nakuru/home-filters";
import { CategoryMegaMenu } from "@/components/app/home/CategoryMegaMenu";

export function PublicAppNav() {
  const { lang } = usePwaInstall();
  const { dispatch } = useNakuruApp();
  const router = useRouter();
  const { highlightTab, cartN, msgUnread, goTab } = usePrimaryNav();
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <nav className="public-app-nav" aria-label="Primary">
      <div
        className="public-app-cat"
        onMouseEnter={() => setMegaOpen(true)}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <button
          type="button"
          className={`public-app-link${highlightTab === "cat" || megaOpen ? " on" : ""}`}
          aria-expanded={megaOpen}
          aria-haspopup="menu"
          onClick={() => setMegaOpen((v) => !v)}
        >
          {homeCopy("navCategory", lang)}
        </button>
        <CategoryMegaMenu
          lang={lang}
          open={megaOpen}
          onClose={() => setMegaOpen(false)}
          onSelect={(slug) => {
            dispatch({ type: "SET_CAT", cat: slug });
            dispatch({ type: "SET_TAB", tab: "home" });
            router.replace(homeFiltersHref({ cat: slug, q: "" }), {
              scroll: false,
            });
          }}
        />
      </div>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navMessage", lang)}
        data-tip={homeCopy("navMessage", lang)}
        onClick={() => goTab("msg")}
      >
        <IconMessageCircle size={20} />
        {msgUnread > 0 ? (
          <span className="public-app-badge">{msgUnread > 9 ? "9+" : msgUnread}</span>
        ) : null}
      </button>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navCart", lang)}
        data-tip={homeCopy("navCart", lang)}
        onClick={() => goTab("cart")}
      >
        <IconShoppingCart size={20} />
        {cartN > 0 ? (
          <span className="public-app-badge">{cartN > 9 ? "9+" : cartN}</span>
        ) : null}
      </button>
      <button
        type="button"
        className="public-app-icon"
        aria-label={homeCopy("navSaved", lang)}
        data-tip={homeCopy("navSaved", lang)}
        onClick={() => dispatch({ type: "ACCOUNT_ROW", id: "acc:saved" })}
      >
        <IconHeart size={20} />
      </button>
      <Link className="btn fl public-app-post" href="/app?start=vendor" prefetch>
        {homeCopy("postListing", lang)}
      </Link>
      <button
        type="button"
        className={`public-app-icon${highlightTab === "acc" ? " on" : ""}`}
        aria-label={homeCopy("navAccount", lang)}
        data-tip={homeCopy("navAccount", lang)}
        onClick={() => goTab("acc")}
      >
        <IconUser size={20} />
      </button>
    </nav>
  );
}
