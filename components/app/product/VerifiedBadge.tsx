import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  className?: string;
  locked?: boolean;
};

/** Matches marketing `verified-badge` treatment in the app shell. */
export function VerifiedBadge({ lang, className = "", locked = false }: Props) {
  return (
    <span
      className={`verified-badge app-verified-badge${locked ? " verified-badge--locked" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {homeCopy("verifiedPill", lang)}
    </span>
  );
}