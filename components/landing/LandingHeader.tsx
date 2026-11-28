"use client";

import Link from "next/link";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { Bi } from "@/components/landing/Bi";
import { LangToggle } from "@/components/landing/LangToggle";
import { useLandingNav } from "@/components/landing/hooks/useLandingNav";
import { useLandingLang } from "@/components/landing/LandingLangContext";

export function LandingHeader() {
  const { toggleMenu, menuOpen } = useLandingNav();
  const { t } = useLandingLang();

  const navLinks = [
    { href: "/app", en: "Explore", sw: "Gundua" },
    { href: "/#categories", en: "Categories", sw: "Kategoria" },
    { href: "/#how", en: "How it works", sw: "Jinsi inavyofanya" },
    { href: "/pos", en: "POS", sw: "POS" },
  ] as const;

  return (
    <>
      <div className="county-bar">
        <div className="wrap county-bar-inner">
          <span>
            <Bi en="Nakuru County · Kenya" sw="Kaunti ya Nakuru · Kenya" />
          </span>
          <span className="county-bar-right">
            <Bi
              en="Discover local. Buy local. Grow local."
              sw="Gundua nyumbani. Nunua nyumbani. Kua nyumbani."
            />
          </span>
        </div>
      </div>
      <header className="top top--classified" id="site-header">
        <div className="wrap header-bar">
          <Link className="logo logo--classified" href="/" aria-label="NakuruHub">
            <BrandLogoMark variant="lockup" size={52} priority />
          </Link>
          <nav className="top-nav" id="site-nav" aria-label="Site">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-en={item.en}
                data-sw={item.sw}
              >
                {t(item.en, item.sw)}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <LangToggle />
            <Link className="btn ghost btn-browse" href="/app?tab=acc">
              <Bi en="Saved" sw="Vilivyohifadhiwa" />
            </Link>
            <Link className="btn fl btn-sell" href="/app?start=vendor">
              <Bi en="Post a listing" sw="Weka tangazo" />
            </Link>
            <button
              type="button"
              className="nav-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              aria-label="Open menu"
              onClick={toggleMenu}
            >
              <span className="nav-menu-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
