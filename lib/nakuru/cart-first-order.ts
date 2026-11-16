import { isOutsideArea } from "@/lib/nakuru/area";

/**
 * UI-only first-order delivery promo eligibility.
 * TODO(server): `createShopOrders` always charges `ZONES[zone]` — no waiver yet.
 */
export type FirstOrderPromoState = "eligible" | "unknown" | "ineligible";

export function firstOrderPromoState(
  signedIn: boolean,
  orderCount: number,
  area: string,
): FirstOrderPromoState {
  if (isOutsideArea(area)) return "ineligible";
  if (!signedIn) return "unknown";
  return orderCount === 0 ? "eligible" : "ineligible";
}