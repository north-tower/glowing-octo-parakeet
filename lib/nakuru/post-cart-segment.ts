const KEY = "nh:openCartSegment";

export type CartOpenSegment = "orders";

export function requestOpenCartSegment(segment: CartOpenSegment): void {
  try {
    sessionStorage.setItem(KEY, segment);
  } catch {
    /* unavailable */
  }
}

export function consumeOpenCartSegment(): CartOpenSegment | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (raw === "orders") return "orders";
  } catch {
    /* unavailable */
  }
  return null;
}