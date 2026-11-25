"use client";

import Link from "next/link";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { BRAND_NAME } from "@/lib/nakuru/brand";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

const SUPPORT_WA =
  "https://wa.me/?text=" + encodeURIComponent("Hi NakuruHub support");

export function AppFooter() {
  const { lang } = usePwaInstall();
  return (
    <footer className="app-footer">
      <div className="app-container app-footer-grid">
        <div>
          <strong>{BRAND_NAME}</strong>
          <p className="m" style={{ marginTop: 8 }}>
            {homeCopy("footerPlace", lang)}
          </p>
        </div>
        <nav className="app-footer-links" aria-label="Footer">
          <Link href="/nakuru" prefetch>
            {homeCopy("footerAbout", lang)}
          </Link>
          <Link href="/nakuru#how" prefetch>
            {homeCopy("footerHow", lang)}
          </Link>
          <Link href="/app?verified=1" prefetch>
            {homeCopy("footerVerified", lang)}
          </Link>
          <Link href="/app?start=vendor" prefetch>
            {homeCopy("footerSell", lang)}
          </Link>
        </nav>
        <nav className="app-footer-links" aria-label="Legal">
          <Link href="/nakuru" prefetch>
            {homeCopy("footerHelp", lang)}
          </Link>
          <Link href="/nakuru" prefetch>
            {homeCopy("footerTerms", lang)}
          </Link>
          <Link href="/nakuru" prefetch>
            {homeCopy("footerPrivacy", lang)}
          </Link>
          <a href={SUPPORT_WA} rel="noopener noreferrer" target="_blank">
            {homeCopy("footerWhatsapp", lang)}
          </a>
        </nav>
      </div>
      <div className="app-container app-footer-meta">
        © {new Date().getFullYear()} {BRAND_NAME} · {homeCopy("footerPlace", lang)}
      </div>
    </footer>
  );
}
