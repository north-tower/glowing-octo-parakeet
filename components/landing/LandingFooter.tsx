"use client";

import Link from "next/link";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { Bi } from "@/components/landing/Bi";
import { LangToggle } from "@/components/landing/LangToggle";
import { BRAND_NAME } from "@/lib/nakuru/brand";

export function LandingFooter() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <strong className="foot-brand-lockup">
            <BrandLogoMark size={28} />
            {BRAND_NAME}
          </strong>
          <p className="mut">
            <Bi
              en="Nakuru’s marketplace — shop, property, cars, services."
              sw="Soko la Nakuru — duka, nyumba, magari, huduma."
            />
          </p>
        </div>
        <nav className="foot-links" aria-label="Footer">
          <Link href="/app?start=vendor">
            <Bi en="Vendor sign-up" sw="Usajili wa muuzaji" />
          </Link>
          <Link href="/app">
            <Bi en="Customer app" sw="Programu ya mnunuzi" />
          </Link>
        </nav>
        <div className="foot-meta">
          <LangToggle />
          <p className="foot-proto">
            <Bi
              en="Prototype — demo data resets on reload."
              sw="Toleo la majaribio — data inajipanga upya ukipakia ukurasa."
            />
          </p>
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