"use client";

import Link from "next/link";
import { Bi } from "@/components/landing/Bi";

export function MobileCtaBar() {
  return (
    <div
      className="mobile-cta-bar is-hidden"
      id="mobile-cta-bar"
      role="region"
      aria-label="Quick actions"
    >
      <Link className="btn fl" href="/app?start=vendor">
        <Bi en="Post a listing" sw="Weka tangazo" />
      </Link>
      <Link className="btn ghost mobile-cta-browse" href="/app">
        <Bi en="Explore" sw="Gundua" />
      </Link>
    </div>
  );
}
