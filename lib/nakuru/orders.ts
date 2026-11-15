import { apiFetch, ApiError } from "@/lib/nakuru/api";
import type { Order } from "@/lib/nakuru/types";
import type { PayMethod } from "@/lib/nakuru/types";

export type ApiOrderItem = {
  productId: string;
  title: string;
  unit: number;
  qty: number;
};

export type ApiOrder = {
  id: string;
  status: string;
  total: number;
  fee: number;
  payment: string;
  paymentStatus: string;
  zone: string;
  address: string;
  vendor: string | null;
  createdAt: string;
  items: ApiOrderItem[];
  code?: string;
};

export type PlaceOrderInput = {
  items: { productId: string; qty: number }[];
  zone: string;
  payment: PayMethod;
  address: string;
  phone?: string;
};

const STATUS_INDEX: Record<string, number> = {
  placed: 0,
  accepted: 1,
  ready: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 0,
};

export function apiOrderToUi(o: ApiOrder): Order {
  const pay =
    o.payment === "mpesa" ? "Paid by M-Pesa" : "Pay on delivery";
  return {
    id: o.id,
    total: o.total,
    pay,
    s: STATUS_INDEX[o.status] ?? 0,
    code: o.code ?? "----",
    live: true,
    status: o.status,
  };
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<ApiOrder[]> {
  const data = await apiFetch<{ orders: ApiOrder[] }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      items: input.items,
      zone: input.zone,
      payment: input.payment,
      address: input.address,
      ...(input.phone ? { phone: input.phone } : {}),
    }),
  });
  return data.orders ?? [];
}

export async function fetchMyOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>("/api/orders/mine");
}

export function checkoutErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : "Could not place order";
  }
  switch (err.body.error) {
    case "out_of_stock":
      return "Something in your cart just sold out. Update quantities and try again.";
    case "unavailable":
      return "A product is no longer available. Remove it and try again.";
    case "mpesa_needs_verified_vendor":
      return "M-Pesa upfront needs verified vendors only.";
    case "mpesa_unavailable":
      return "M-Pesa is not available yet. Choose pay on delivery.";
    case "phone_required":
      return "Add a phone number so the rider can reach you.";
    case "own_product":
      return "You cannot buy your own listings.";
    case "unauthorized":
      return "Sign in with your email code to place an order.";
    case "bad_request":
      return "Check your delivery address and try again.";
    default:
      return "Could not place order. Try again in a moment.";
  }
}