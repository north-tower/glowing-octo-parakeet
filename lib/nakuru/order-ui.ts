import type { LandingLang } from "@/lib/nakuru/i18n";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { Order, OrderItemSnap } from "@/lib/nakuru/types";

export type OrderTrackStep = "placed" | "accepted" | "out" | "delivered";

export const TRACK_STEPS: OrderTrackStep[] = [
  "placed",
  "accepted",
  "out",
  "delivered",
];

export type OrderStatusTone =
  | "placed"
  | "accepted"
  | "out"
  | "delivered"
  | "cancelled";

export function shortOrderId(id: number | string): string {
  const s = String(id);
  if (s.length <= 10) return `#${s}`;
  const head = s.slice(0, 4).toUpperCase();
  const tail = s.slice(-4);
  return `#${head}…${tail}`;
}

export function fullOrderId(id: number | string): string {
  return String(id);
}

export function orderProgressStep(o: Order): number {
  if (o.live && o.status) {
    switch (o.status) {
      case "placed":
        return 0;
      case "accepted":
      case "ready":
        return 1;
      case "out_for_delivery":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
      case "refused":
        return -1;
      default:
        return 0;
    }
  }
  if (o.s >= 4) return 3;
  if (o.s >= 3) return 2;
  if (o.s >= 1) return 1;
  return 0;
}

export function orderStatusTone(o: Order): OrderStatusTone {
  if (o.live && o.status === "cancelled") return "cancelled";
  if (!o.live && o.s < 0) return "cancelled";
  const step = orderProgressStep(o);
  if (step >= 3) return "delivered";
  if (step === 2) return "out";
  if (step === 1) return "accepted";
  return "placed";
}

export function isActiveOrder(o: Order): boolean {
  if (o.live) {
    return o.status !== "delivered" && o.status !== "cancelled" && o.status !== "refused";
  }
  return o.s < 4;
}

export function isPastOrder(o: Order): boolean {
  return !isActiveOrder(o);
}

export function orderStatusLabel(o: Order, lang: LandingLang): string {
  const tone = orderStatusTone(o);
  const key =
    tone === "placed"
      ? "orderStatusPlaced"
      : tone === "accepted"
        ? "orderStatusAccepted"
        : tone === "out"
          ? "orderStatusOut"
          : tone === "delivered"
            ? "orderStatusDelivered"
            : "orderStatusCancelled";
  return homeCopy(key, lang);
}

export function trackStepLabel(step: OrderTrackStep, lang: LandingLang): string {
  const map: Record<OrderTrackStep, Parameters<typeof homeCopy>[0]> = {
    placed: "orderTrackStepPlaced",
    accepted: "orderTrackStepAccepted",
    out: "orderTrackStepOut",
    delivered: "orderTrackStepDelivered",
  };
  return homeCopy(map[step], lang);
}

export function itemSummary(items: OrderItemSnap[] | undefined, lang: LandingLang): string {
  if (!items?.length) return homeCopy("orderItemsUnknown", lang);
  const first = items[0]!.title;
  const extra = items.length - 1;
  if (extra <= 0) return first;
  return homeCopy("orderItemsMore", lang).replace("{title}", first).replace("{n}", String(extra));
}

export function orderSubtotal(o: Order): number {
  if (o.items?.length) {
    return o.items.reduce((a, i) => a + i.unit * i.qty, 0);
  }
  const fee = o.fee ?? 0;
  return Math.max(0, o.total - fee);
}

export function orderDeliveryFee(o: Order): number {
  if (o.promoFreeDelivery) return 0;
  return o.fee ?? Math.max(0, o.total - orderSubtotal(o));
}

export function showDeliveryCode(o: Order): boolean {
  if (!o.code || o.code === "----") return false;
  return isActiveOrder(o);
}

export function isDemoTracking(o: Order): boolean {
  return !o.live;
}

export function formatOrderDate(iso: string | undefined, lang: LandingLang): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const loc = lang === "sw" ? "sw-KE" : "en-KE";
    return d.toLocaleString(loc, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}