"use client";

import { Bi } from "@/components/landing/Bi";
import { posAppUrl } from "@/lib/seo/pos-url";

export function TryTillLink({ className }: { className?: string }) {
  const href = posAppUrl();
  if (!href) return null;
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Bi en="Try the till" sw="Jaribu kaunta" />
    </a>
  );
}
