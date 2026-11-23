"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Props = {
  onBack?: () => void;
  className?: string;
};

export function AuthBackLink({ onBack, className = "" }: Props) {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [onBack, router]);

  return (
    <button
      type="button"
      onClick={goBack}
      className={`group -ml-1 mb-4 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${className}`}
    >
      <ChevronLeft
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      />
      Back
    </button>
  );
}

/** Fallback for crawlers / no-JS — same target as Back when no history. */
export function AuthBackLinkFallback() {
  return (
    <Link
      href="/"
      className="sr-only focus:not-sr-only focus:inline-flex"
    >
      Back home
    </Link>
  );
}