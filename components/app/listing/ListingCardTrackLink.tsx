"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { recordProductOpen } from "@/lib/nakuru/pwa-engage";
import { persistDetailNavTab } from "@/lib/nakuru/detail-nav-tab";

type Props = {
  href: string;
  className?: string;
  ariaLabel: string;
  id: number | string;
  children: ReactNode;
};

export function ListingCardTrackLink({
  href,
  className,
  ariaLabel,
  id,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        persistDetailNavTab("home");
        recordProductOpen(id);
        window.dispatchEvent(new Event("nh:engage"));
      }}
    >
      {children}
    </Link>
  );
}