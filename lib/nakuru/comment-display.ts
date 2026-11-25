import type { LandingLang } from "@/lib/nakuru/i18n";

export type ListingCommentRow = {
  id: string;
  body: string;
  authorHandle: string;
  authorId: string;
  createdAt: string;
};

const HANDLE_MAX = 32;

export function commentInitials(handle: string): string {
  const parts = handle.trim().split(/[\s._-]+/).filter(Boolean);
  if (!parts.length) return "?";
  const letters = parts.slice(0, 2).map((w) => w[0] ?? "");
  return letters.join("").toUpperCase();
}

export function commentPublicHandle(
  email: string | null | undefined,
): string {
  const local = email?.split("@")[0]?.trim() ?? "";
  if (!local) return "member";
  return local.slice(0, HANDLE_MAX);
}

export function formatCommentTime(
  iso: string,
  lang: LandingLang,
  nowMs: number = Date.now(),
): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const deltaSec = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (deltaSec < 60) {
    return lang === "sw" ? "sasa hivi" : "just now";
  }
  const mins = Math.floor(deltaSec / 60);
  if (mins < 60) {
    return lang === "sw" ? `dakika ${mins}` : `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 48) {
    return lang === "sw" ? `saa ${hours}` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return lang === "sw" ? `siku ${days}` : `${days}d ago`;
}
