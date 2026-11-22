export type AppMode = "shopping" | "selling";

const MODE_KEY = "nh:appMode";

export function wantsSellingEntry(
  start: string | null,
  hasVendorQueryFlag: boolean,
): boolean {
  return start === "vendor" || hasVendorQueryFlag;
}

export function readAppMode(): AppMode {
  try {
    const raw = sessionStorage.getItem(MODE_KEY);
    if (raw === "selling") return "selling";
  } catch {
    /* unavailable */
  }
  return "shopping";
}

export function persistAppMode(mode: AppMode): void {
  try {
    sessionStorage.setItem(MODE_KEY, mode);
  } catch {
    /* unavailable */
  }
}

export function clearAppMode(): void {
  try {
    sessionStorage.removeItem(MODE_KEY);
  } catch {
    /* unavailable */
  }
}
