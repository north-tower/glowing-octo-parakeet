const DISMISS_KEY = "nh-vendor-sell-dismissed-at";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

function now(): number {
  return Date.now();
}

export function markVendorSellCardDismissed(): void {
  localStorage.setItem(DISMISS_KEY, String(now()));
}

export function canShowVendorSellCard(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return true;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return true;
  return now() - ts >= DISMISS_MS;
}