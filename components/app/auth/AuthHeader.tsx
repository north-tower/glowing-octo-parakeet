import Link from "next/link";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { BRAND_NAME } from "@/lib/nakuru/brand";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[var(--bg)]/95 px-5 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--bg)]/80">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
      >
        <BrandLogoMark variant="lockup" size={32} priority />
        <span className="sr-only">{BRAND_NAME}</span>
      </Link>
    </header>
  );
}