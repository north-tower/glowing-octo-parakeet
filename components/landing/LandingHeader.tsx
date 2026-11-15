"use client";

import Link from "next/link";
import { Bi } from "@/components/landing/Bi";
import { LangToggle } from "@/components/landing/LangToggle";
import { useLandingNav } from "@/components/landing/hooks/useLandingNav";

export function LandingHeader() {
  const { toggleMenu } = useLandingNav();

  return (
    <header className="top" id="site-header">
      <div className="wrap header-bar">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden="true">
            🦩
          </span>
          <span className="logo-text">NakuruHub</span>
        </Link>
        <nav className="top-nav" id="site-nav" aria-label="On this page">
          <Bi as="a" href="#categories" en="Categories" sw="Kategoria" />
          <Bi as="a" href="#why" en="Why sell" sw="Kwa nini uuze" />
          <Bi as="a" href="#how" en="How it works" sw="Jinsi inavyofanya" />
          <Bi as="a" href="#faq" en="FAQ" sw="Maswali" />
        </nav>
        <div className="header-actions">
          <LangToggle />
          <Link className="btn ghost btn-browse" href="/app">
            <Bi en="Browse app" sw="Tazama programu" />
          </Link>
          <Link className="btn fl btn-sell" href="/app?start=vendor">
            <Bi en="Start selling" sw="Anza kuuza" />
          </Link>
          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={false}
            aria-controls="site-nav"
            aria-label="Open menu"
            onClick={toggleMenu}
          >
            <span className="nav-menu-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}