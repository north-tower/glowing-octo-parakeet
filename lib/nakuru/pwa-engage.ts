const VISIT_KEY = "nh-visit-count";
const PRODUCTS_KEY = "nh-product-opens";
const CART_KEY = "nh-ever-cart";
const DISMISS_KEY = "nh-install-dismissed-at";
const PROMPT_COOLDOWN_KEY = "nh-install-prompt-cooldown";
const INSTALLED_KEY = "nh-pwa-installed";
const RETRIGGER_KEY = "nh-install-retrigger";

const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function now(): number {
  return Date.now();
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  const store = storage();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function recordAppVisit(): void {
  const store = storage();
  if (!store) return;
  const n = Number(store.getItem(VISIT_KEY) ?? "0") + 1;
  store.setItem(VISIT_KEY, String(n));
}

export function recordProductOpen(id: string | number): void {
  const store = storage();
  if (!store) return;
  const set = new Set(readJson<string[]>(PRODUCTS_KEY, []));
  set.add(String(id));
  store.setItem(PRODUCTS_KEY, JSON.stringify([...set]));
}

export function recordCartEngagement(): void {
  storage()?.setItem(CART_KEY, "1");
}

export function isEngagedForInstall(): boolean {
  const store = storage();
  if (!store) return false;
  const visits = Number(store.getItem(VISIT_KEY) ?? "0");
  const products = readJson<string[]>(PRODUCTS_KEY, []).length;
  const cart = store.getItem(CART_KEY) === "1";
  return visits >= 2 || products >= 2 || cart;
}

export function markInstallDismissed(): void {
  const store = storage();
  if (!store) return;
  store.setItem(DISMISS_KEY, String(now()));
  store.removeItem(RETRIGGER_KEY);
}

export function markPromptDismissed(): void {
  storage()?.setItem(PROMPT_COOLDOWN_KEY, String(now()));
}

export function markInstalled(): void {
  storage()?.setItem(INSTALLED_KEY, "1");
}

export function readInstalled(): boolean {
  return storage()?.getItem(INSTALLED_KEY) === "1";
}

export function requestInstallRetrigger(): void {
  storage()?.setItem(RETRIGGER_KEY, String(now()));
}

function withinCooldown(tsKey: string, ms: number): boolean {
  const ts = Number(storage()?.getItem(tsKey) ?? "0");
  return ts > 0 && now() - ts < ms;
}

export function canShowInstallCard(): boolean {
  const store = storage();
  if (!store) return false;
  if (withinCooldown(DISMISS_KEY, DISMISS_MS) && !store.getItem(RETRIGGER_KEY)) {
    return false;
  }
  if (withinCooldown(PROMPT_COOLDOWN_KEY, PROMPT_COOLDOWN_MS)) {
    return false;
  }
  return isEngagedForInstall();
}

export function clearRetriggerAfterShow(): void {
  storage()?.removeItem(RETRIGGER_KEY);
}

export function dispatchInstallEvent(
  name:
    | "nh:install-shown"
    | "nh:install-clicked"
    | "nh:install-accepted"
    | "nh:install-dismissed",
  detail?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export type InstallPlatform =
  | "android-chromium"
  | "ios"
  | "in-app"
  | "generic";

const IN_APP_RE =
  /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|LinkedInApp|wv\)/i;

export function detectInstallPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "generic";
  const ua = navigator.userAgent;
  if (IN_APP_RE.test(ua)) return "in-app";
  const ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return "ios";
  if (/Android/i.test(ua)) return "android-chromium";
  return "generic";
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}