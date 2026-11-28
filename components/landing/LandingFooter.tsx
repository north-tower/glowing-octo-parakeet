"use client";

import Link from "next/link";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { Bi } from "@/components/landing/Bi";
import { LangToggle } from "@/components/landing/LangToggle";

export function LandingFooter() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <strong className="foot-brand-lockup">
            <BrandLogoMark variant="lockup" size={64} />
          </strong>
          <p className="mut">
            <Bi
              en="Nakuru’s marketplace — shop, property, cars, services."
              sw="Soko la Nakuru — duka, nyumba, magari, huduma."
            />
          </p>
        </div>
        <nav className="foot-links" aria-label="Footer">
          <Link href="/nakuru">
            <Bi en="Browse Nakuru" sw="Vinjari Nakuru" />
          </Link>
          <Link href="/app?start=vendor">
            <Bi en="Vendor sign-up" sw="Usajili wa muuzaji" />
          </Link>
          <Link href="/app">
            <Bi en="Customer app" sw="Programu ya mnunuzi" />
          </Link>
          <Link href="/pos">
            <Bi en="NakuruHub POS" sw="NakuruHub POS" />
          </Link>
        </nav>
        <div className="foot-meta">
          <LangToggle />
        </div>
      </div>
      <div className="foot-bottom">
        <p className="foot-copy">
          <Bi
            en="© 2026 NakuruHub · Nakuru, Kenya"
            sw="Hakimiliki © 2026 NakuruHub · Nakuru, Kenya"
          />
        </p>
      </div>
    </footer>
  );
}